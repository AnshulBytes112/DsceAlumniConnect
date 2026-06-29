# 🤖 AI Assistance - Alumni Connect Context

This file is optimized for LLMs (Gemini, Claude, GPT) to provide high-signal context for coding tasks, debugging, and feature implementation in the **Alumni Connect** codebase.

---

## 1. Project Summary (Dense)
**Alumni Connect** is a full-stack Spring Boot (v3.5.7) and React (Vite/TS) application for student-alumni networking. Core features include a social feed, discussion forums (WebSockets), job portal, and a Gemini-powered resume-to-profile parser. Data is stored in MongoDB, with Redis for session/cache.

---

## 2. System Map
- **Frontend**: `/frontend` (Vite, React, TS, Tailwind)
- **Backend**: `/backend` (Spring Boot, MongoDB, Redis)
- **Deployment**: GitHub Actions (`.github/workflows/maven.yml`)
- **API Client**: `/frontend/src/lib/api.ts` (All REST calls)
- **Real-time**: `/backend/.../Controller/ForumWebSocketController.java` (STOMP/WS)

---

## 3. Key Entry Points
- **Backend App**: `backend/src/main/java/com/dsce/AlumniConnect/AlumniConnectApplication.java`
- **Frontend App**: `frontend/src/main.tsx` (Vite entry)
- **Global Types**: `frontend/src/lib/api.ts` (Interface definitions)

---

## 4. Important Files to Read First
1. **`backend/pom.xml`**: Dependency list (Spring Boot 3.5.7, Gemini, PDFBox).
2. **`frontend/src/lib/api.ts`**: Frontend ↔ Backend contract.
3. **`backend/.../config/SpringSecurity.java`**: Auth and CORS rules.
4. **`backend/.../Service/GeminiResumeService.java`**: AI logic example.
5. **`backend/.../filter/JwtFilter.java`**: Authentication middleware.

---

## 5. Core Concepts & Terminology
- **Roles**: `STUDENT`, `ALUMNI`, `ADMIN`.
- **Parsing**: Refers to the Gemini-powered resume extraction process.
- **Discussion Hierarchy**: Group -> Topic -> Post.
- **Verification**: Profile status (`PENDING`, `APPROVED`, `REJECTED`) managed by admins.

---

## 6. Backend Rules (Spring Boot)
- **Pattern**: Controller → Service → Repository.
- **No Direct Repo Access**: Controllers MUST only call Services; Services MUST only call Repositories.
- **DTOs**: Use DTOs for all API requests/responses (found in `com.dsce.alumniconnect.DTO`).
- **Validation**: Use `@Valid` and Bean Validation annotations on DTOs.

---

## 7. Frontend Rules
- **API Calls**: **DO NOT** use `fetch` or `axios` directly in components. Always add a method to the `ApiClient` class in `api.ts` and call it from the component.
- **Types**: Always define or reuse interfaces from `api.ts`.
- **State**: Use Context for global auth state; use local state/hooks for page-specific data.

---

## 8. Developer Workflows
### Add a Feature (Full-Stack)
1. Add Entity in `/entity` and Repository in `/Repository`.
2. Add DTOs in `/DTO`.
3. Create Service logic and Controller endpoint.
4. Update `frontend/src/lib/api.ts` with new interfaces and methods.
5. Create React page/component and consume the API.

### Add an API Endpoint
1. Define Request/Response DTOs.
2. Add Service method.
3. Add Controller method with appropriate Spring Security mapping (e.g., `@PreAuthorize`).
4. Update `api.ts`.

---

## 9. Commands
- **Backend (Dev)**: `mvn spring-boot:run`
- **Frontend (Dev)**: `npm run dev` (inside `/frontend`)
- **Build All**: `mvn clean install` (backend) and `npm run build` (frontend)
- **Test**: `mvn test` (backend)

---

## 10. AI Behavior Guidelines (STRICT)
- **Incremental Edits**: Prefer minimal changes to existing logic.
- **Architecture Consistency**: Respect the C-S-R pattern on the backend and API Client pattern on the frontend.
- **Layer Integrity**: Do not bypass the Service layer for "quick fixes."
- **Traceability**: When modifying an API, always check the corresponding impact in `api.ts` and its consuming components.
- **Security**: Always verify `@PreAuthorize` tags when adding or modifying endpoints.

---

