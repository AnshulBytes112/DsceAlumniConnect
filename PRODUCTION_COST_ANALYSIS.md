# Alumni Connect Production Cost Analysis

Date: April 10, 2026  
Prepared for: Production readiness and stakeholder meeting

## 1. Executive Summary

This project can run for thousands of users at low monthly cost if deployed with:

- Static frontend hosting + CDN
- One right-sized Java backend instance
- Managed MongoDB (small production tier)
- Object storage for resumes/images (not local disk)
- Strict budget controls for AI resume parsing

Expected monthly cost range:

- 5,000 monthly active users: 70 to 140 USD
- 20,000 monthly active users: 170 to 340 USD
- 50,000 monthly active users: 420 to 850 USD

At an approximate exchange rate of 1 USD = 83 INR:

- 5,000 MAU: 5,800 to 11,600 INR
- 20,000 MAU: 14,100 to 28,200 INR
- 50,000 MAU: 34,900 to 70,600 INR

## 2. Current Architecture Inputs (From Codebase)

- Frontend: React + Vite (static build output)
- Backend: Spring Boot 3.5, Java 17
- Database: MongoDB
- Realtime: WebSocket endpoints present
- Files: resumes and images uploaded
- AI integration: resume parsing via Groq/Gemini provider config

These inputs drive costs in five places:

- Compute (backend)
- Database (MongoDB)
- Storage + bandwidth (uploads)
- Caching/message (optional Redis)
- AI token usage (resume parsing)

## 3. Costing Assumptions

All estimates are monthly and conservative.

- Average active session length: 8 to 12 minutes
- Average API calls per session: 20 to 35
- Resume uploads are the largest variable cost trigger
- Image and resume files are served from object storage + CDN
- Single-region deployment initially
- Production availability target: 99.5% to 99.9%

## 4. Recommended Low-Cost Production Setup

Use this as the default budget-first architecture.

- Frontend: Cloudflare Pages / Netlify static hosting (free to low-cost tier)
- Backend API: 2 vCPU, 4 GB RAM Linux instance (single node at start)
- Database: MongoDB Atlas M10 or equivalent managed MongoDB
- Storage: S3-compatible object storage for uploads
- CDN: Cloudflare free/pro
- TLS + DNS: Cloudflare
- Observability: lightweight metrics + log retention cap (7 to 14 days)

## 5. Monthly Cost Breakdown by Stage

### Stage A: Early Production (about 5,000 MAU)

| Component | Monthly Cost (USD) | Notes |
|---|---:|---|
| Frontend static hosting + CDN | 0 to 15 | Mostly free at this stage |
| Backend compute (2vCPU/4GB) | 20 to 35 | Single instance |
| MongoDB managed small prod tier | 45 to 70 | Atlas M10-like range |
| Object storage (100 to 200 GB) | 3 to 10 | Includes request overhead |
| Optional Redis/cache | 0 to 15 | Start free or tiny plan |
| Monitoring/logging | 5 to 15 | Keep retention short |
| **Subtotal (without AI)** | **73 to 160** | |

Recommended budget target: 90 to 140 USD.

### Stage B: Growth (about 20,000 MAU)

| Component | Monthly Cost (USD) | Notes |
|---|---:|---|
| Frontend + CDN | 10 to 30 | Higher bandwidth |
| Backend compute | 45 to 90 | Vertical scale or 2 small instances |
| MongoDB | 90 to 140 | Move to medium managed tier |
| Object storage (300 to 700 GB) | 10 to 30 | More file usage |
| Redis/cache | 10 to 30 | Useful for session/hot data |
| Monitoring/logging | 10 to 20 | |
| **Subtotal (without AI)** | **175 to 340** | |

Recommended budget target: 200 to 320 USD.

### Stage C: Scale-Lite (about 50,000 MAU)

| Component | Monthly Cost (USD) | Notes |
|---|---:|---|
| Frontend + CDN | 25 to 60 | |
| Backend compute | 120 to 260 | 2 to 4 app instances |
| MongoDB | 180 to 350 | Medium-high managed tier |
| Object storage (1 TB+) | 25 to 90 | Depends on upload behavior |
| Redis/cache | 20 to 60 | |
| Monitoring/logging | 20 to 40 | |
| **Subtotal (without AI)** | **390 to 860** | |

Recommended budget target: 420 to 850 USD.

## 6. AI Resume Parsing Cost Model (Critical Variable)

Resume parsing cost can become significant if upload volume spikes.

Use this formula:

Monthly AI Cost = Number of Parses x Cost per Parse

Planning envelope:

- Low-efficiency pipeline: 0.010 USD per parse
- Optimized pipeline: 0.002 to 0.005 USD per parse

Examples:

- 2,000 parses/month: 4 to 20 USD
- 10,000 parses/month: 20 to 100 USD
- 30,000 parses/month: 60 to 300 USD

Cost-control policy for meeting approval:

- Set a hard AI monthly budget cap
- Queue and rate-limit parsing jobs
- Cache parsed output and block duplicate parsing for same file hash

## 7. How to Keep Cost Cheap (Action Plan)

### Infra and Platform

- Keep backend as single instance until sustained CPU is above 65%
- Scale database only after actual read/write pressure is measured
- Put all file uploads in object storage, never local VM disk
- Enable CDN caching for static assets and public media

### Application-Level

- Add pagination to all heavy list endpoints
- Add response compression (gzip/br)
- Cache frequently requested dashboard and listing responses
- Disable debug-level logs in production

### AI and Upload Control

- Parse resume only on-demand, not automatically on every upload
- Use async queue for parsing and worker concurrency limits
- Reject oversize files early
- Keep only required file versions

### Finance Guardrails

- Budget alerts at 50%, 80%, and 100%
- Daily cost export dashboard for engineering + product
- Monthly cost review with top 3 cost drivers and corrective actions

## 8. Suggested Budget for Meeting Approval

Ask for approval with a phased budget envelope:

- Phase 1 (0 to 5k MAU): 150 USD/month cap
- Phase 2 (5k to 20k MAU): 350 USD/month cap
- Phase 3 (20k to 50k MAU): 900 USD/month cap

Include 20% contingency in finance planning for traffic spikes.

## 9. Risks and Cost Impact

| Risk | Cost Impact | Mitigation |
|---|---|---|
| AI parse traffic spike | High | Queue + budget cap + rate limit |
| File growth (resumes/images) | Medium | Lifecycle policies + compression |
| No caching at scale | Medium | Redis + response caching |
| Over-provisioned backend | Medium | Autoscale only after thresholds |
| Excessive log retention | Low-Medium | 7 to 14 day retention default |

## 10. Production Cost Readiness Checklist

- [ ] Move uploads from local path to object storage in production
- [ ] Add environment-variable based secret management
- [ ] Configure budget alerts in cloud account
- [ ] Add API request metrics and p95 latency dashboards
- [ ] Add AI parse quota and monthly cap
- [ ] Confirm backup and restore policy for MongoDB

## 11. One-Slide Talking Points for Meeting

- We can launch at low cost for thousands of users.
- Base infra is affordable; AI parsing and storage are the main variable costs.
- Phased budget caps + alerts keep spend under control.
- Current architecture is suitable for 5k to 20k MAU with minor production hardening.
- Recommended immediate cap: 150 USD/month for initial launch phase.

