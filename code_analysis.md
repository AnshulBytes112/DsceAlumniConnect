# 🎓 Alumni Connect - Full-Stack Code Analysis

This document provides a deep technical analysis of the **Alumni Connect** project, a full-stack platform designed to bridge the gap between students and alumni.

---

## 1. Project Overview
**Alumni Connect** is a community-centric platform featuring:
- **Profile Management**: Detailed student and alumni profiles.
- **Career Portal**: Job postings, applications, and automated resume parsing.
- **Engagement**: Real-time forums, discussion groups, and post-based social feeds.
- **Event Management**: Event creation, RSVP tracking, and admin oversight.
- **Analytics**: Admin dashboard for system-wide health monitoring.

---

## 2. Full-Stack Architecture
The project follows a modern decoupled architecture:
- **Frontend**: React 18+ with TypeScript, powered by Vite.
- **Backend**: Spring Boot 3.5.7 (Java 17) following a strict Controller-Service-Repository pattern.
- **Database**: MongoDB (Primary store for users, posts, and entities).
- **Caching/Session**: Redis (Configured for session management and likely caching).
- **Communication**: REST APIs for most interactions, WebSockets (STOMP) for real-time forum discussions.

---

## 3. Backend (Spring Boot)

### Core Package: `com.dsce.alumniconnect`

#### Controllers (API Layer)
- `AuthController`: Handles JWT-based login, signup, and Google OAuth integration.
- `ProfileController`: Manages user profile updates, including file uploads (images/resumes).
- `PostController` / `CommentController`: Social feed logic.
- `DiscussionGroupController` / `DiscussionTopicController`: Forum hierarchy management.
- `ForumWebSocketController`: Handles real-time message broadcasting.
- `ResumeParserController`: Entry point for AI-driven resume analysis.
- `AdminController`: Elevated permissions for user verification and system management.

#### Services (Business Logic)
- `AuthService`: Orchestrates authentication and token generation.
- `GeminiResumeService`: **Critical Module.** Uses Google's Gemini API to parse PDF resumes into structured JSON data.
- `ProfileService`: Complex logic for data aggregation and profile completeness.
- `FileStorageService`: Handles local or cloud-based file persistence for uploads.

#### Entity Relationships (MongoDB)
- **User**: The central entity with roles (`STUDENT`, `ALUMNI`, `ADMIN`).
- **Post** ↔ **Comment**: 1:N relationship for social interactions.
- **DiscussionGroup** → **DiscussionTopic** → **DiscussionPost**: 3-tier forum hierarchy.
- **Event** ↔ **EventRSVP**: Tracks user attendance.
- **JobPost** ↔ **JobApplication**: Career workflow entities.

---

## 4. Frontend (React + TypeScript)

### Structure
- `/src/pages`: 29+ distinct views including Admin Analytics, Forum Details, and Profile Setup.
- `/src/components`: Modular UI elements (Modals, Navbars, Feed cards).
- `/src/lib/api.ts`: **Central API Client.** A custom class wrapping `fetch` with integrated JWT handling and session management.
- `/src/contexts`: Global state managers like `AuthContext` for user session persistence.

### State Management
- Primarily uses **React Context** for global state (Auth).
- **Local State**: Extensive use of `useState` and `useEffect` for page-level data fetching.

---

## 5. API Layer
- **Base URL**: `http://localhost:8080` (Configurable via `API_BASE_URL` in `api.ts`).
- **Auth Pattern**: Bearer Token (JWT).
- **Session Security**: The frontend automatically checks for token expiration every 5 minutes and prompts for re-login or clears state.

---

## 6. Execution Flow (End-to-End)
1. **Onboarding**: User registers -> OTP Verification (`VerifyOtp.tsx`) -> Profile Setup.
2. **Resume Parsing**: User uploads PDF -> Frontend hits `/profile/resume/update-parse` -> Backend extracts text via PDFBox -> Gemini AI structures the data -> UI populates profile fields.
3. **Engagement**: User joins a Discussion Group -> STOMP connection established -> Real-time message exchange via `ForumWebSocketController`.

---

## 7. Data Flow
`User Action (UI)` → `api.ts Client` → `JwtFilter (Validation)` → `Spring Controller` → `Service (Logic)` → `Repository (Mongo)` → `Database`

---

## 8. Dependencies
### Backend
- **Spring Boot 3.5.7**: High-performance Java framework.
- **jjwt**: JWT creation and verification.
- **PDFBox**: Parsing PDF content for the resume service.
- **ModelMapper**: Simplifying DTO-to-Entity conversions.
- **Redis**: For managing sessions and data consistency.

### Frontend
- **Vite**: Ultra-fast build tool.
- **Lucide-React**: Modern iconography.
- **Tailwind CSS**: Utility-first styling.

---

## 9. Critical Modules Deep Dive

### Gemini Resume Parser
Located in `GeminiResumeService.java`, this module is a standout feature. It uses advanced prompting to convert raw PDF text into a `ResumeParserResponse` DTO, automating the tedious profile creation process for alumni.

### Forum Real-time Engine
Uses `WebSocketConfig` and `ForumWebSocketController`. It enables a low-latency discussion experience, crucial for the "Connect" aspect of the platform.

---

## 10. Developer Gotchas
- **Missing Resources**: The `src/main/resources/application.properties` file is gitignored. New developers **MUST** copy `application-example.properties` (if available) or manually configure MongoDB/Redis/Gemini credentials.
- **Session Expiry**: The frontend has a hardcoded 5-minute session check (`isTokenExpired()` in `api.ts`). If the backend's JWT validity differs, it can cause sync issues.
- **TypeScript Strictness**: Interfaces in `api.ts` are extremely detailed but must be updated concurrently with Backend DTO changes to avoid build breaks.
- **CORS Configuration**: Handled in `WebConfig.java`. Ensure the frontend port (typically 5173 for Vite) is whitelisted.
