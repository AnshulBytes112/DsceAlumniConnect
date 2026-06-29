#!/usr/bin/env python3
"""Evaluate the resume parser against a Kaggle dataset.

This script downloads the Kaggle dataset, discovers a usable resume source
automatically, sends each sample to the Groq API using the same JSON schema
as the backend parser, and generates a markdown report plus machine-readable
metrics.

The evaluation focuses on two practical questions:
- How many resumes can be parsed before the API key/quota stops the run?
- How complete is each parsed result when compared to the expected resume schema?

Because the Kaggle dataset typically does not ship with ground-truth structured
resume labels, the script reports a structural completeness score instead of a
fake exact-match accuracy number.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import textwrap
import time
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

import requests

try:
    import kagglehub
except ImportError as exc:  # pragma: no cover - dependency message only
    raise SystemExit(
        "kagglehub is required. Install it with: pip install kagglehub"
    ) from exc


DATASET_ID = "snehaanbhawal/resume-dataset"
DEFAULT_MODEL = os.getenv("GROQ_API_MODEL", "llama-3.3-70b-versatile")
DEFAULT_API_URL = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
DEFAULT_MAX_SAMPLES = int(os.getenv("RESUME_EVAL_MAX_SAMPLES", "50"))

@dataclass
class EvaluationRowResult:
    sample_index: int
    source_name: str
    source_type: str
    parse_success: bool
    quota_limited: bool
    error_code: str | None
    error_message: str | None
    profile_score: float
    work_score: float
    education_score: float
    project_score: float
    achievement_score: float
    skills_score: float
    completeness_score: float
    duration_ms: int


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate the resume parser on a Kaggle dataset")
    parser.add_argument("--dataset-id", default=DATASET_ID, help="Kaggle dataset id, e.g. snehaanbhawal/resume-dataset")
    parser.add_argument("--file-path", default="", help="Optional dataset-relative PDF path to evaluate")
    parser.add_argument("--max-samples", type=int, default=DEFAULT_MAX_SAMPLES, help="Maximum resumes to evaluate")
    parser.add_argument("--output-dir", default="reports/resume-parser-eval", help="Directory for generated report artifacts")
    parser.add_argument("--api-key", default=os.getenv("GROQ_API_KEY", ""), help="Groq API key. Defaults to GROQ_API_KEY env var")
    parser.add_argument("--api-model", default=DEFAULT_MODEL, help="Groq model name")
    parser.add_argument("--api-url", default=DEFAULT_API_URL, help="Groq chat completions URL")
    parser.add_argument("--stop-on-quota", action="store_true", default=True, help="Stop when a quota or rate-limit error is encountered")
    parser.add_argument("--continue-on-error", action="store_true", help="Continue after non-quota parse failures")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    started_at = datetime.utcnow()

    if not args.api_key:
        print("GROQ_API_KEY is required. Set it in the environment or pass --api-key.", file=sys.stderr)
        return 2

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    dataset_root = download_dataset(args.dataset_id)
    if args.file_path:
        pdf_path = (dataset_root / args.file_path).resolve()
        if pdf_path.suffix.lower() != ".pdf":
            print("--file-path must point to a PDF file.", file=sys.stderr)
            return 3
        samples = build_samples_from_pdf_path(pdf_path)
        source_descriptor = str(Path(args.file_path))
    else:
        samples = build_samples_from_files(dataset_root, args.max_samples)
        source_descriptor = "pdf-auto-discovery"

    if not samples:
        print("No resume samples were found in the dataset.", file=sys.stderr)
        return 3

    results: list[EvaluationRowResult] = []
    parsed_count = 0
    quota_count = 0
    failure_count = 0
    started_eval = time.perf_counter()

    for index, sample in enumerate(samples, start=1):
        row_started = time.perf_counter()
        parsed, error = parse_single_resume(sample["text"], args.api_key, args.api_model, args.api_url)
        duration_ms = int((time.perf_counter() - row_started) * 1000)

        if parsed is not None:
            parsed_count += 1
            metrics = score_parsed_resume(parsed)
            result = EvaluationRowResult(
                sample_index=index,
                source_name=sample["source_name"],
                source_type=sample["source_type"],
                parse_success=True,
                quota_limited=False,
                error_code=None,
                error_message=None,
                duration_ms=duration_ms,
                **metrics,
            )
        else:
            failure_count += 1
            quota_limited = error.get("quota_limited", False)
            if quota_limited:
                quota_count += 1
            result = EvaluationRowResult(
                sample_index=index,
                source_name=sample["source_name"],
                source_type=sample["source_type"],
                parse_success=False,
                quota_limited=quota_limited,
                error_code=error.get("code"),
                error_message=error.get("message"),
                profile_score=0.0,
                work_score=0.0,
                education_score=0.0,
                project_score=0.0,
                achievement_score=0.0,
                skills_score=0.0,
                completeness_score=0.0,
                duration_ms=duration_ms,
            )

        results.append(result)

        if result.quota_limited and args.stop_on_quota:
            break

        if not parsed and not result.quota_limited and not args.continue_on_error:
            break

    elapsed_seconds = time.perf_counter() - started_eval
    summary = build_summary(results, parsed_count, failure_count, quota_count, elapsed_seconds, dataset_root, source_descriptor, args, started_at)

    results_path = output_dir / "results.json"
    report_path = output_dir / "report.md"
    summary_path = output_dir / "summary.json"

    results_path.write_text(json.dumps([asdict(item) for item in results], indent=2), encoding="utf-8")
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    report_path.write_text(render_report(summary, results), encoding="utf-8")

    print(json.dumps(summary, indent=2))
    print(f"\nReport written to: {report_path}")
    print(f"Results written to: {results_path}")
    return 0


def download_dataset(dataset_id: str) -> Path:
    if not hasattr(kagglehub, "dataset_download"):
        raise RuntimeError("kagglehub.dataset_download is unavailable in this environment")
    return Path(kagglehub.dataset_download(dataset_id))


def build_samples_from_pdf_path(pdf_path: Path) -> list[dict[str, str]]:
    if not pdf_path.exists() or pdf_path.suffix.lower() != ".pdf":
        return []

    text = extract_text_from_pdf(pdf_path)
    if not text.strip():
        return []

    return [{"source_name": pdf_path.name, "source_type": "pdf", "text": text}]


def build_samples_from_files(dataset_root: Path, max_samples: int) -> list[dict[str, str]]:
    samples: list[dict[str, str]] = []
    for path in sorted(dataset_root.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() == ".pdf":
            text = extract_text_from_pdf(path)
            if text.strip():
                samples.append({"source_name": str(path.relative_to(dataset_root)), "source_type": "pdf", "text": text})
        if len(samples) >= max_samples:
            break
    return samples


def extract_text_from_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        return ""

    reader = PdfReader(str(path))
    texts: list[str] = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        if page_text.strip():
            texts.append(page_text)
    return "\n".join(texts)


def is_present(value: Any) -> bool:
    if value is None:
        return False
    text = str(value).strip()
    return bool(text) and text.lower() != "nan"


def parse_single_resume(resume_text: str, api_key: str, api_model: str, api_url: str) -> tuple[dict[str, Any] | None, dict[str, Any]]:
    prompt = build_prompt(resume_text)
    payload = {
        "model": api_model,
        "temperature": 0.1,
        "messages": [{"role": "user", "content": prompt}],
    }

    try:
        response = requests.post(
            api_url,
            json=payload,
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
            timeout=120,
        )
    except requests.RequestException as exc:
        return None, {"code": "REQUEST_ERROR", "message": str(exc), "quota_limited": False}

    if response.status_code != 200:
        body = response.text
        quota_limited = response.status_code == 429 or is_quota_or_rate_limit_message(body)
        return None, {
            "code": f"HTTP_{response.status_code}",
            "message": body,
            "quota_limited": quota_limited,
        }

    try:
        parsed = extract_json_from_groq_response(response.text)
        normalized = normalize_resume_json_for_report(parsed)
        return normalized, {}
    except Exception as exc:
        return None, {"code": "PARSE_ERROR", "message": str(exc), "quota_limited": False}


def is_quota_or_rate_limit_message(message: str) -> bool:
    lowered = message.lower()
    return any(token in lowered for token in ["429", "quota", "resource_exhausted", "rate limit", "rate-limit"])


def build_prompt(resume_text: str) -> str:
    return textwrap.dedent(
        f"""
        You are an expert resume parser. Parse the following resume and return ONLY a valid JSON object with this exact structure:

        {{
          "profile": {{
            "name": "string",
            "email": "string",
            "phone": "string",
            "url": "string",
            "graduationYear": "string",
            "department": "string",
            "summary": "string",
            "location": "string"
          }},
          "workExperiences": [
            {{
              "company": "string",
              "jobTitle": "string",
              "month": "string",
              "year": "string",
              "endMonth": "string",
              "endYear": "string",
              "currentlyWorking": boolean,
              "date": "string",
              "descriptions": ["string"]
            }}
          ],
          "educations": [
            {{
              "school": "string",
              "degree": "string",
              "month": "string",
              "year": "string",
              "endMonth": "string",
              "endYear": "string",
              "currentlyPursuing": boolean,
              "date": "string",
              "gpa": "string",
              "descriptions": ["string"]
            }}
          ],
          "projects": [
            {{
              "project": "string",
              "date": "string",
              "descriptions": ["string"]
            }}
          ],
          "achievements": [
            {{
              "title": "string",
              "description": "string",
              "date": "string"
            }}
          ],
          "skills": {{
            "featuredSkills": [
              {{
                "skill": "string",
                "rating": number
              }}
            ],
            "descriptions": ["string"]
          }}
        }}

        Rules:
        1. Extract ALL relevant information from the resume
        2. For dates, use month/year format if available
        3. For descriptions, return as array of strings (one per line or bullet point)
        4. If a field is not found, use null or empty array
        5. Infer currentlyWorking=true if no end date, false if end date exists
        6. Keep text concise and clean
        7. Return ONLY the JSON object, no additional text

        Resume text:
        {resume_text}
        """
    ).strip()


def extract_json_from_groq_response(api_response: str) -> dict[str, Any]:
    response_node = json.loads(api_response)
    choices = response_node.get("choices") or []
    if not choices:
        raise RuntimeError("Invalid Groq API response: no choices")
    message = choices[0].get("message") or {}
    text_content = message.get("content") or ""
    return json.loads(extract_json_from_text(text_content))


def extract_json_from_text(text: str) -> str:
    json_text = re.sub(r"```json|```", "", text).strip()
    json_start = json_text.find("{")
    if json_start != -1:
        json_text = json_text[json_start:]
    return json_text


def normalize_resume_json_for_report(raw_json: dict[str, Any]) -> dict[str, Any]:
    root = raw_json or {}
    profile = root.get("profile") or {}
    normalized = {
        "profile": {
            "name": read_text(profile, root, "name", "fullName"),
            "email": read_text(profile, root, "email"),
            "phone": read_text(profile, root, "phone", "contactNumber", "mobile"),
            "url": read_text(profile, root, "url", "website", "linkedinProfile", "linkedin"),
            "graduationYear": read_text(profile, root, "graduationYear", "gradYear", "classYear", "yearOfGraduation"),
            "department": read_text(profile, root, "department", "branch", "major"),
            "summary": read_text(profile, root, "summary", "bio", "headline"),
            "location": read_text(profile, root, "location", "address"),
        },
        "workExperiences": read_array(root, "workExperiences", "workExperience", "experiences", "experience"),
        "educations": read_array(root, "educations", "education"),
        "projects": read_array(root, "projects", "project"),
        "achievements": normalize_achievements_array(root),
        "skills": normalize_skills(root),
    }
    return normalized


def normalize_skills(root: dict[str, Any]) -> dict[str, Any]:
    source_skills = root.get("skills")
    featured_skills = read_array(root, "featuredSkills")
    descriptions: list[str] = []

    if isinstance(source_skills, dict):
        obj_featured = source_skills.get("featuredSkills")
        if not featured_skills and isinstance(obj_featured, list):
            featured_skills = obj_featured
        obj_descriptions = source_skills.get("descriptions")
        if isinstance(obj_descriptions, list):
            descriptions = [str(item).strip() for item in obj_descriptions if is_present(item)]
    elif isinstance(source_skills, list):
        descriptions = [str(item).strip() for item in source_skills if is_present(item)]
    elif is_present(source_skills):
        descriptions = split_csv_values(str(source_skills))

    return {
        "featuredSkills": featured_skills if isinstance(featured_skills, list) else [],
        "descriptions": descriptions,
    }


def normalize_achievements_array(root: dict[str, Any]) -> list[dict[str, str]]:
    achievements = read_array(root, "achievements", "awards", "certifications", "honors")
    normalized: list[dict[str, str]] = []
    for item in achievements:
        if not isinstance(item, dict):
            text = str(item).strip()
            if text:
                normalized.append({"title": text, "description": "", "date": ""})
            continue

        title = read_text(item, root, "title", "name", "award", "achievement")
        description = read_text(item, root, "description", "details", "summary")
        date = read_text(item, root, "date", "year", "issued", "awardedOn")
        if title or description:
            normalized.append({"title": title, "description": description, "date": date})
    return normalized


def read_text(primary: dict[str, Any] | Any, fallback: dict[str, Any] | Any, *keys: str) -> str:
    for key in keys:
        if isinstance(primary, dict) and is_present(primary.get(key)):
            return str(primary.get(key)).strip()
        if isinstance(fallback, dict) and is_present(fallback.get(key)):
            return str(fallback.get(key)).strip()
    return ""


def read_array(root: dict[str, Any], *keys: str) -> list[Any]:
    for key in keys:
        value = root.get(key)
        if isinstance(value, list):
            return value.copy()
    return []


def split_csv_values(value: str) -> list[str]:
    return [part.strip() for part in value.split(",") if part.strip()]


def score_parsed_resume(parsed: dict[str, Any]) -> dict[str, float]:
    profile_score = score_profile(parsed.get("profile") or {})
    work_score = score_collection(parsed.get("workExperiences") or [], ["company", "jobTitle", "date", "year", "month"])
    education_score = score_collection(parsed.get("educations") or [], ["school", "degree", "date", "year", "month"])
    project_score = score_collection(parsed.get("projects") or [], ["project", "date", "descriptions"])
    achievement_score = score_collection(parsed.get("achievements") or [], ["title", "description", "date"])
    skills_score = score_skills(parsed.get("skills") or {})

    completeness_score = round(
        (
            profile_score * 0.35
            + work_score * 0.20
            + education_score * 0.15
            + project_score * 0.10
            + achievement_score * 0.05
            + skills_score * 0.15
        ),
        4,
    )

    return {
        "profile_score": round(profile_score, 4),
        "work_score": round(work_score, 4),
        "education_score": round(education_score, 4),
        "project_score": round(project_score, 4),
        "achievement_score": round(achievement_score, 4),
        "skills_score": round(skills_score, 4),
        "completeness_score": completeness_score,
    }


def score_profile(profile: dict[str, Any]) -> float:
    fields = ["name", "email", "phone", "url", "graduationYear", "department", "summary", "location"]
    populated = sum(1 for field in fields if is_present(profile.get(field)))
    return populated / len(fields)


def score_collection(items: list[Any], essential_fields: list[str]) -> float:
    if not items:
        return 0.0

    scores: list[float] = []
    for item in items:
        if isinstance(item, dict):
            populated = sum(1 for field in essential_fields if is_present(item.get(field)))
            scores.append(populated / len(essential_fields))
        elif is_present(item):
            scores.append(0.5)
    return sum(scores) / len(scores) if scores else 0.0


def score_skills(skills: dict[str, Any]) -> float:
    featured = skills.get("featuredSkills") or []
    descriptions = skills.get("descriptions") or []
    featured_score = 1.0 if featured else 0.0
    descriptions_score = 1.0 if descriptions else 0.0
    return (featured_score + descriptions_score) / 2


def build_summary(
    results: list[EvaluationRowResult],
    parsed_count: int,
    failure_count: int,
    quota_count: int,
    elapsed_seconds: float,
    dataset_root: Path,
    source_descriptor: str,
    args: argparse.Namespace,
    started_at: datetime,
) -> dict[str, Any]:
    total = len(results)
    avg_completeness = sum(item.completeness_score for item in results if item.parse_success) / parsed_count if parsed_count else 0.0
    parse_success_rate = parsed_count / total if total else 0.0
    effective_efficiency = parse_success_rate * avg_completeness
    avg_duration_ms = sum(item.duration_ms for item in results) / total if total else 0.0

    return {
        "dataset_id": args.dataset_id,
        "dataset_root": str(dataset_root),
        "source_descriptor": source_descriptor,
        "max_samples": args.max_samples,
        "samples_evaluated": total,
        "parsed_resumes": parsed_count,
        "failed_resumes": failure_count,
        "quota_limited_resumes": quota_count,
        "parse_success_rate": round(parse_success_rate, 4),
        "average_completeness": round(avg_completeness, 4),
        "effective_efficiency": round(effective_efficiency, 4),
        "average_duration_ms": round(avg_duration_ms, 2),
        "elapsed_seconds": round(elapsed_seconds, 2),
        "started_at_utc": started_at.isoformat() + "Z",
        "finished_at_utc": datetime.utcnow().isoformat() + "Z",
        "notes": [
            "Accuracy is reported as structural completeness because the Kaggle resume dataset does not typically include ground-truth structured labels.",
            "If the dataset exposes labeled fields, extend score_parsed_resume to compare against those labels for a true exact-match metric.",
        ],
    }


def render_report(summary: dict[str, Any], results: list[EvaluationRowResult]) -> str:
    failures = [item for item in results if not item.parse_success]
    top_failures = failures[:10]
    lines = [
        "# Resume Parser Evaluation Report",
        "",
        f"Dataset: `{summary['dataset_id']}`",
        f"Source: `{summary['source_descriptor'] or 'auto-discovered'}`",
        f"Samples evaluated: `{summary['samples_evaluated']}`",
        f"Parsed resumes: `{summary['parsed_resumes']}`",
        f"Parse success rate: `{summary['parse_success_rate'] * 100:.2f}%`",
        f"Average completeness: `{summary['average_completeness'] * 100:.2f}%`",
        f"Effective efficiency: `{summary['effective_efficiency'] * 100:.2f}%`",
        f"Average response time: `{summary['average_duration_ms']:.2f} ms`",
        "",
        "## Method",
        "1. Download the Kaggle dataset with `kagglehub`.",
        "2. Auto-detect the first tabular resume source or fallback to PDF/text files.",
        "3. Send each sample through the Groq API with the same resume schema used by the backend.",
        "4. Normalize the JSON and score structural completeness across profile, experience, education, projects, achievements, and skills.",
        "5. Stop early if the API returns a quota/rate-limit error.",
        "",
        "## What This Measures",
        "- `parse success rate`: how many samples returned valid structured JSON.",
        "- `average completeness`: how full the parsed records are against the target schema.",
        "- `effective efficiency`: `parse success rate * average completeness`.",
        "",
        "## Findings",
        f"- Total samples: `{summary['samples_evaluated']}`",
        f"- Successful parses: `{summary['parsed_resumes']}`",
        f"- Failed parses: `{summary['failed_resumes']}`",
        f"- Quota-limited parses: `{summary['quota_limited_resumes']}`",
        "",
    ]

    if top_failures:
        lines.extend([
            "## Sample Failures",
            "",
        ])
        for item in top_failures:
            lines.append(f"- `{item.source_name}` ({item.error_code or 'UNKNOWN'}): {item.error_message or 'No message'}")
        lines.append("")

    lines.extend([
        "## Suggestions",
        "- If parse success is low, lower the prompt temperature and simplify the schema.",
        "- If completeness is low, add post-processing for dates, skills, and education fields.",
        "- If quota stops the run early, cache parsed results by resume hash and batch evaluations over time.",
        "- If the dataset contains labels, add exact-match scoring for a real accuracy metric.",
        "",
        "## Artifacts",
        "- `results.json`: per-sample structured metrics.",
        "- `summary.json`: aggregate metrics and run metadata.",
        "",
        "## Notes",
        "- The backend contract now includes `graduationYear` and `department` in `profile`.",
        "- The parser prompt was aligned to the frontend-facing schema before evaluation.",
    ])

    return "\n".join(lines)


if __name__ == "__main__":
    raise SystemExit(main())