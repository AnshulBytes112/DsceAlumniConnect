# DSCE Alumni Connect 🎓

An enterprise-grade, full-stack platform designed to bridge the gap between current students, alumni, and faculty of DSCE. The platform provides a dynamic environment for networking, mentorship, event management, real-time forums, and AI-driven professional growth.

---

## 🏗️ Technology Stack

### **Frontend Architecture (React + Vite)**
- **Framework:** React 18 with TypeScript for strict type-safety.
- **Styling & UI:** Tailwind CSS combined with custom components (`@/components/ui`) and PostCSS.
- **Animations:** Framer Motion for highly fluid, interactive page transitions and modals.
- **State Management:** React Context API (`AuthContext`) and modular React Hooks.
- **Routing:** React Router DOM (v6) with Protected Routes and Role-Based Redirects.
- **Network Client:** Centralized Axios instance (`apiClient.ts`) with automatic JWT injection, 401 interceptors, and Idempotency key generation.

### **Backend Architecture (Spring Boot 3)**
- **Framework:** Spring Boot (Java 17+)
- **Database:** MongoDB (via Spring Data MongoDB) for flexible document storage.
- **Distributed Caching & Locking:** Redis (Handles distributed locks, Idempotency caching, and API rate limiting).
- **Security:** Spring Security with stateless JWT (JSON Web Tokens) authentication and OTP email verification.
- **Real-Time Communication:** Spring WebSockets/STOMP (for real-time forum updates, likes, and comments).
- **AI Integrations:** Google Gemini & Groq APIs for intelligent PDF Resume parsing.
- **Cloud Storage:** Cloudinary integration for scalable media uploads (Profile pictures, Resumes, Forum images).

---

## ✨ Comprehensive Feature Matrix

### 1. **Authentication & Access Control**
- **Email & OTP Verification:** Secure registration flow that requires OTP verification before account activation.
- **JWT Sessions:** Stateless authentication with access tokens stored securely on the client.
- **Role-Based Access Control (RBAC):** Strict boundaries between `USER` and `ADMIN` roles. Admins have access to exclusive dashboards and global moderation tools.

### 2. **AI-Powered Profile Management**
- **Gemini AI Resume Parsing:** Users can upload their PDF resumes (`ResumeService.java` & `GeminiResumeService.java`). The backend securely streams the PDF, extracts text using PDFBox, and leverages the **Google Gemini (or Groq)** LLMs to intelligently parse work experience, education, projects, and skills directly into their digital profile!
- **Dynamic Portfolios:** Users can edit their headlines, current companies, social links, and locations via the `EditProfile.tsx` interface.

### 3. **Alumni Directory & Networking**
- **Smart Directory:** A highly optimized `Alumni.tsx` directory featuring batch/year accordion layouts to ensure fast rendering of large alumni lists.
- **Advanced Filtering:** Filter peers by Graduation Year, Department, Current Company, and specific Skills.
- **Connection Engine:** Send, accept, or reject peer connection requests (`ConnectionController.java`). The UI optimistic-updates to reflect pending states instantly.

### 4. **Real-Time Discussion Forums**
- **Topics & Groups:** Structured discussion spaces (`DiscussionTopic` & `DiscussionGroup`) for specific topics or departments.
- **Live Feeds via WebSockets:** `ForumWebSocketController` pushes live updates for new posts, comments, and likes directly to the client without page reloads.
- **Media Attachments:** Users can attach multiple images to their posts (auto-uploaded to Cloudinary).
- **Global Moderation:** Users with `ROLE_ADMIN` bypass ownership checks and can edit or delete any inappropriate content across the platform.

### 5. **Career & Job Board**
- **Post Opportunities:** Alumni and recruiters can post job openings and internships (`JobPostController`).
- **Direct Networking:** Job cards feature a "Connect to Alumni" button, seamlessly routing candidates to the job poster's profile to facilitate direct networking.

### 6. **Event & Announcement Management**
- **Ticketing & RSVP:** Browse upcoming campus events, submit RSVPs, and automatically generate secure QR Code tickets (`EventRSVPRepository.java`).
- **Featuring:** Admins can pin important Announcements and Events to the top of the homepage feed.

### 7. **Gallery & Achievers (Admin Managed)**
- **Campus Life:** A visual grid (`GalleryImage`) showcasing campus events.
- **Notable Achievers:** A dedicated module (`Achiever`) highlighting highly successful alumni.
- **Integrated Admin UI:** `Gallery.tsx` detects Admin users and renders inline File Upload Modals. Admins can upload images directly from their PC, which are streamed to Cloudinary and saved to MongoDB seamlessly.

### 8. **Admin Dashboards & Analytics**
- **Live Analytics:** `AdminAnalytics.tsx` provides high-level metrics on user registrations, job postings, and platform engagement.
- **User Management:** Complete control to verify pending users, export alumni data to Excel spreadsheets, and manage platform roles.

---

## 🛡️ Enterprise Infrastructure & Security

- **Global Idempotency Engine:** To prevent double-taps, network lag duplicates, or malicious replay attacks, the platform utilizes an `IdempotencyInterceptor`. The frontend automatically generates an `X-Idempotency-Key` (UUID) for every mutating request (`POST`, `PUT`, `DELETE`). The backend checks Redis to ensure the key hasn't been processed in the last 24 hours.
- **Distributed Locks:** Critical concurrent operations use Redis-based distributed locking (`DistributedLockService.java`) to prevent race conditions during high-traffic events (e.g., event RSVP limits).
- **Method-Level Security:** Backend endpoints are strictly gated using Spring's `@PreAuthorize("hasRole('ADMIN')")`.

---

## 🚀 Local Development Setup

### **1. Prerequisites**
- Node.js (v18+)
- Java 17+
- Maven
- Redis (Running locally or via Docker on port 6379)
- MongoDB (Running locally or Atlas cluster)
- Cloudinary Account (API Key, Secret, and Cloud Name)
- Google Gemini API Key (For AI Resume Parsing)

### **2. Environment Variables**

**Backend (`backend/src/main/resources/application.properties` or `application-prod.yaml`)**
```properties
# Database & Cache
spring.data.mongodb.uri=mongodb://localhost:27017/alumni_connect
spring.data.redis.host=localhost
spring.data.redis.port=6379

# Security
jwt.secret=YOUR_SECURE_JWT_SECRET_KEY

# Cloudinary Storage
cloudinary.url=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# AI Resume Parsing
gemini.api.key=YOUR_GEMINI_KEY
groq.api.key=YOUR_GROQ_KEY_FALLBACK
```

**Frontend (`frontend/.env`)**
```env
VITE_API_BASE_URL=http://localhost:8080
```

### **3. Running the Application**

**Start the Backend Server:**
```bash
cd backend
mvn spring-boot:run
```

**Start the Frontend Client:**
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## ☁️ Deployment Notes (Production)

When deploying to platforms like Render, AWS, or Heroku:
1. Ensure the backend is running with the active `prod` profile (`SPRING_PROFILES_ACTIVE=prod`). 
2. Ensure your Cloud Redis instance is properly linked to the backend via `REDIS_URL`.
3. Configure `CORS_ALLOWED_ORIGINS` to point exactly to your frontend's production domain.
4. For the frontend, build the production bundle utilizing:
```bash
npm run build
```

---

## 💰 Paid Services & Production Costs

When scaling this platform for production, be aware of the following third-party services that may incur costs or require premium tiers depending on your user volume:

1. **Google Gemini API (or Groq)**
   - **Usage:** Core driver of the AI Resume Parsing engine.
   - **Cost Factor:** Billed per token (input characters/PDF text + output JSON). The platform employs fallback mechanisms and rate-limit handling, but heavy resume parsing traffic will require a paid/Pro tier to avoid `429 Too Many Requests` errors.

2. **Cloudinary (Media Storage & CDN)**
   - **Usage:** Hosts all user avatars, PDF resumes, forum post images, and gallery images.
   - **Cost Factor:** While the free tier provides generous bandwidth and storage, storing thousands of high-res images and PDFs will quickly consume the free storage quota. A premium plan is necessary for long-term data retention and global CDN delivery speed.

3. **Redis (Upstash / Render Redis)**
   - **Usage:** Essential for the `IdempotencyInterceptor` (duplicate request prevention), API Rate Limiting, and Distributed Locks (preventing RSVP race conditions).
   - **Cost Factor:** Needs a robust, low-latency persistent plan in production. Free instances usually drop connections or evict keys too quickly, which would break the Idempotency locks.

4. **MongoDB Atlas**
   - **Usage:** Primary database for the entire platform.
   - **Cost Factor:** The free cluster (M0) limits connections and storage (512MB). You will need a dedicated cluster (e.g., M10 or above) to handle the connection pooling from Spring Boot and the sheer volume of Forum Posts, Users, and Events.

5. **Application Hosting (Render, AWS, GCP)**
   - **Usage:** Running the Spring Boot backend and serving the React frontend.
   - **Cost Factor:** The Spring Boot application requires a minimum of 1GB RAM (preferably 2GB+) to handle Java's garbage collection and concurrent WebSockets efficiently. Free-tier servers will likely crash due to Out-Of-Memory (OOM) errors.
