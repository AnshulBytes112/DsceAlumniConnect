# Resume Parser Evaluation Report

Dataset: `snehaanbhawal/resume-dataset`
Source: `pdf-auto-discovery`
Samples evaluated: `1`
Parsed resumes: `0`
Parse success rate: `0.00%`
Average completeness: `0.00%`
Effective efficiency: `0.00%`
Average response time: `372.00 ms`

## Method
1. Download the Kaggle dataset with `kagglehub`.
2. Auto-detect the first tabular resume source or fallback to PDF/text files.
3. Send each sample through the Gemini API with the same resume schema used by the backend.
4. Normalize the JSON and score structural completeness across profile, experience, education, projects, achievements, and skills.
5. Stop early if the API returns a quota/rate-limit error.

## What This Measures
- `parse success rate`: how many samples returned valid structured JSON.
- `average completeness`: how full the parsed records are against the target schema.
- `effective efficiency`: `parse success rate * average completeness`.

## Findings
- Total samples: `1`
- Successful parses: `0`
- Failed parses: `1`
- Quota-limited parses: `0`

## Sample Failures

- `data\data\ACCOUNTANT\10554236.pdf` (HTTP_400): {
  "error": {
    "code": 400,
    "message": "API key not valid. Please pass a valid API key.",
    "status": "INVALID_ARGUMENT",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        "reason": "API_KEY_INVALID",
        "domain": "googleapis.com",
        "metadata": {
          "service": "generativelanguage.googleapis.com"
        }
      },
      {
        "@type": "type.googleapis.com/google.rpc.LocalizedMessage",
        "locale": "en-US",
        "message": "API key not valid. Please pass a valid API key."
      }
    ]
  }
}


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