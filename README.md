# Alumni Connect

A full-stack alumni networking platform that connects students and alumni through profiles, events, jobs, social posts, and discussion forums.

This README is written for both development onboarding and project report preparation.

## 1. Executive Summary

Alumni Connect is built as a modern web platform with:
- Frontend: React + TypeScript + Vite
- Backend: Spring Boot + Java 17 + MongoDB
- Authentication: JWT + Google OAuth
- Collaboration features: posts, comments, events, jobs, and forums
- Resume intelligence: PDF resume upload and parsing integration
- Admin workflows: verification, analytics, and moderation features

The repository includes product planning documents, cost analysis, and production roadmap artifacts for stakeholder review.

## 2. Problem Statement

Educational institutions need a unified alumni platform where:
- Students can discover alumni and opportunities
- Alumni can share jobs, events, and mentorship opportunities
- Administrators can verify user credibility and monitor engagement

Alumni Connect solves this through a role-aware platform with authenticated user journeys, admin control panels, and integrated profile enrichment from resumes.

## 3. Key Objectives

- Build a centralized alumni-student networking system
- Provide verified identity and profile management
- Enable event discovery and RSVP workflows
- Support job posting and application discovery
- Offer community interactions via feeds and discussion forums
- Maintain scalability readiness for multi-thousand active users

## 4. High-Level Architecture

## System Components
- Web Client: React SPA with route-level lazy loading
- API Server: Spring Boot REST APIs and WebSocket endpoints
- Database: MongoDB for users, events, posts, jobs, and forums
- Cache/Session Support: Redis and Mongo-backed session support in dependencies
- File Handling: profile images, post images, and resume uploads
- Parsing Submodule: TypeScript-based resume parser integrated with backend flows

## Request Flow
1. User accesses frontend on local dev server.
2. Frontend calls backend APIs (default base URL: http://localhost:8080).
3. Backend validates JWT, executes business logic, and persists to MongoDB.
4. File uploads are stored under backend-managed directories in local development.
5. Resume parse endpoints invoke parser services for profile auto-fill scenarios.

## 5. Technology Stack

## Frontend
- React 19
- TypeScript 5
- Vite 7
- React Router
- React Query
- TailwindCSS
- Radix UI primitives
- Leaflet (maps)
- Recharts (analytics charts)
- STOMP + SockJS (real-time messaging integration)

## Backend
- Java 17
- Spring Boot 3.5.x
- Spring Security
- Spring Data MongoDB
- Spring WebSocket
- JWT (jjwt)
- Maven build system
- Lombok

## Data and Services
- MongoDB
- Redis dependency included for caching/session use cases
- Google OAuth client integration
- AI provider configuration points for resume processing (Groq/Gemini settings present)

## Utility/Support Modules
- backend/open_resume: TypeScript resume parser module adapted from OpenResume
- backend/scripts: MongoDB seeding utilities (faker + mongodb)

## 6. Functional Modules

## Authentication and Access
- Email/password sign up and login
- Google login support
- JWT-based authorization
- Protected user routes and admin-only routes

## User Profile and Identity
- Profile setup and edit
- Profile picture upload
- Resume upload and parse/update parse workflows
- Alumni listing and alumni detail pages

## Dashboard
- User-level summary metrics
- Announcements and events widgets
- Funding and activity-related endpoints

## Social and Community
- Post creation and feed interactions
- Like/share/bookmark/report actions
- Comment threads
- Discussion groups, topics, and posts

## Events
- Event listing and featured events
- Event creation
- RSVP updates
- Event detail views

## Jobs
- Job listing and detail views
- User-owned job listings
- Job creation and deletion

## Admin Panel
- Verification queue and decisions
- Analytics endpoints
- Event feature/unfeature/delete controls
- Admin account management endpoint(s)

## 7. API Surface (Representative)

Base URL (local):
- http://localhost:8080

Representative endpoint groups:
- /auth/* and /api/auth/*
- /profile/* and /api/profile/*
- /dashboard/* and /api/dashboard/*
- /events/* and /api/events/*
- /api/jobs/*
- /posts/* and /api/posts/*
- /comments/* and /api/comments/*
- /discussions/* and /api/discussions/*
- /api/admin/*

Note: Multiple controllers expose dual patterns (with and without /api), which supports compatibility but should be standardized in future hardening.

## 8. Repository Structure

Primary working directories:
- frontend/: main React application
- backend/: main Spring Boot service
- backend/open_resume/: resume parsing module
- backend/scripts/: seeding scripts

Planning and report documents:
- PRODUCTION_ROADMAP.md
- PRODUCTION_COST_ANALYSIS.md
- COST_ANALYSIS.md
- TEAM_ASSIGNMENTS.md

Legacy/parallel directories also exist in workspace and should be treated carefully:
- Alumni-Conncet-Frontend/
- Alumni-Connect-backend/

## 9. Local Development Setup

## Prerequisites
- Node.js 20+ and npm
- Java 17
- Maven 3.9+
- MongoDB (local or cloud URI)

## Backend Setup
1. Open terminal in backend/
2. Configure src/main/resources/application.properties
3. Start backend:

```bash
mvn spring-boot:run
```

Backend default port: 8080

## Frontend Setup
1. Open terminal in frontend/
2. Install dependencies:

```bash
npm install
```

3. Start dev server:

```bash
npm run dev
```

Frontend default port is provided by Vite (typically 5173).

## Resume Parser Setup (Optional but Recommended)
1. Open terminal in backend/open_resume/
2. Install dependencies:

```bash
npm install
```

3. Run parser tests if needed:

```bash
npm test
```

## Data Seeding (Optional)
1. Open terminal in backend/scripts/
2. Install dependencies and run seed script:

```bash
npm install
npm start
```

## 10. Build and Quality Commands

Frontend:
```bash
npm run build
npm run lint
npm run preview
```

Backend:
```bash
mvn clean install
mvn test
```

Note: Current Maven configuration includes skipTests=true in surefire plugin, so test execution behavior should be verified and adjusted for CI quality gates.

## 11. Security and Production Notes

Current codebase indicates production hardening tasks still in progress. For deployment readiness:
- Move secrets/API keys out of property files into environment variables or secret managers
- Restrict CORS from wildcard to explicit allowed origins
- Move file uploads from local disk paths to object storage in production
- Apply API rate limiting and request validation hardening
- Ensure logs do not expose tokens or sensitive user data

## 12. Scalability and Cost Perspective

Based on included cost and roadmap documents:
- The architecture is suitable for phased rollout
- Cost envelope is documented for 5k, 20k, and 50k MAU scenarios
- AI resume parsing cost is identified as a variable driver
- Production rollout plan is organized into readiness, deployment, and optimization phases

## 13. Known Gaps and Improvement Opportunities

- Frontend README is still template-level and should be replaced with project-specific docs
- Backend setup docs mention files that may not currently exist (example config parity check needed)
- API naming is not fully normalized between /api and non-/api paths
- Workspace contains similarly named legacy folders that can confuse onboarding

## 14. Suggested Report Sections (Copy-Ready)

For academic or stakeholder report submission, use this structure:
1. Abstract
2. Problem Statement
3. Proposed Solution
4. Architecture and Tech Stack
5. Module Breakdown
6. API Design and Security
7. Deployment and Cost Plan
8. Team Plan and Timeline
9. Risks and Mitigation
10. Future Scope

## 15. Future Scope

- Notification engine and real-time messaging expansion
- Better analytics and alumni engagement insights
- Advanced recommendation systems for jobs/events/mentorship
- Full CI/CD with staged quality gates and automated security scans
- Multi-region deployment and observability dashboards

## 16. Credits

- Resume parsing module includes work adapted from OpenResume in backend/open_resume

---

If needed, this README can be further converted into a formal report document format (IEEE/college template) using the same section mapping.
