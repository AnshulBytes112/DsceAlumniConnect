# Resume Parser Evaluation Report

Dataset: `snehaanbhawal/resume-dataset`
Source: `pdf-auto-discovery`
Samples evaluated: `4`
Parsed resumes: `3`
Parse success rate: `75.00%`
Average completeness: `66.80%`
Effective efficiency: `50.10%`
Average response time: `3386.75 ms`

## Method
1. Download the Kaggle dataset with `kagglehub`.
2. Auto-detect the first tabular resume source or fallback to PDF/text files.
3. Send each sample through the Groq API with the same resume schema used by the backend.
4. Normalize the JSON and score structural completeness across profile, experience, education, projects, achievements, and skills.
5. Stop early if the API returns a quota/rate-limit error.

## What This Measures
- `parse success rate`: how many samples returned valid structured JSON.
- `average completeness`: how full the parsed records are against the target schema.
- `effective efficiency`: `parse success rate * average completeness`.

## Findings
- Total samples: `4`
- Successful parses: `3`
- Failed parses: `1`
- Quota-limited parses: `1`

## Sample Failures

- `data\data\ACCOUNTANT\11759079.pdf` (HTTP_429): {"error":{"message":"Rate limit reached for model `llama-3.3-70b-versatile` in organization `org_01kn3sf5kbfvqrzhnd5khvp3s6` service tier `on_demand` on tokens per minute (TPM): Limit 12000, Used 11176, Requested 1735. Please try again in 4.555s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}


## Suggestions
- If parse success is low, lower the prompt temperature and simplify the schema.
- If completeness is low, add post-processing for dates, skills, and education fields.
- If quota stops the run early, cache parsed results by resume hash and batch evaluations over time.
- If the dataset contains labels, add exact-match scoring for a real accuracy metric.

## Artifacts
- `results.json`: per-sample structured metrics.
- `summary.json`: aggregate metrics and run metadata.

## Notes
- The backend contract now includes `graduationYear` and `department` in `profile`.
- The parser prompt was aligned to the frontend-facing schema before evaluation.