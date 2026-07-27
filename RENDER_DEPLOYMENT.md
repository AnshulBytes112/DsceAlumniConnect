### Render Deployment Guide for Alumni Connect

This guide covers deploying the full stack on [Render](https://render.com).

#### 1. Database: MongoDB Atlas (Required)
Render does not provide managed MongoDB.
1.  Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  In "Network Access", allow access from `0.0.0.0/0` (or use Render's outgoing IPs if on a paid plan).
3.  Get your **Connection String** (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/alumni_connect`).

#### 2. Backend: Render Web Service
1.  **New > Web Service**.
2.  Connect your GitHub repository.
3.  **Name**: `alumni-backend`
4.  **Environment**: `Docker`
5.  **Docker Command**: (Leave empty, it uses the Dockerfile)
6.  **Advanced > Add Environment Variables**:
    *   `SPRING_DATA_MONGODB_URI`: Your MongoDB Atlas connection string.
    *   `JWT_SECRET`: A long random string (minimum 256 bits recommended).
    *   `PORT`: `8080` (Render will automatically route traffic here).
    *   `SPRING_PROFILES_ACTIVE`: `prod` (Use production configuration).
    *   `CORS_ALLOWED_ORIGINS`: `https://your-frontend-url.onrender.com` (Add after frontend is created).
    *   `APP_FRONTEND_URL`: `https://your-frontend-url.onrender.com` **(CRITICAL: Required for password reset emails to contain correct reset link)**.
    *   `SPRING_MAIL_HOST`: `smtp.gmail.com` (or your email provider).
    *   `SPRING_MAIL_PORT`: `587`.
    *   `SPRING_MAIL_USERNAME`: Your email address.
    *   `SPRING_MAIL_PASSWORD`: Your email app password (NOT your Gmail password; use app-specific password).
    *   `RESUME_AI_PROVIDER`: `groq`
    *   `GROQ_API_KEY`: Your key.

> **Note on File Uploads**: Render's file system is ephemeral. Uploaded images will be DELETED when the service restarts. 
> To persist images, go to **Disk > Add Disk**:
> *   **Mount Path**: `/app/uploads_data`
> *   **Name**: `uploads-storage`
> *   **Size**: `1GB` (Free tier doesn't support disks; use a paid plan or a service like Cloudinary for free storage).

#### 3. Frontend: Render Static Site
1.  **New > Static Site**.
2.  Connect your GitHub repository.
3.  **Name**: `alumni-frontend`
4.  **Build Command**: `cd frontend && npm install && npm run build`
5.  **Publish Directory**: `frontend/dist`
6.  **Advanced > Add Environment Variables**:
    *   `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com`
    *   `VITE_GOOGLE_CLIENT_ID`: Your client ID.
7.  **Redirects/Rewrites**:
    *   Go to **Settings > Redirects/Rewrites**.
    *   Add: `/*` -> `/index.html` (Status: `200` for SPA routing).

#### 4. Redis (Optional for Session/Cache)
1.  **New > Redis**.
2.  Name it `alumni-redis`.
3.  Copy the **Internal Redis URL**.
4.  Add to Backend Env Vars:
    *   `SPRING_DATA_REDIS_URL`: The Redis URL.

#### 5. Password Reset Feature - IMPORTANT
The password reset feature sends emails with a reset link. Ensure these are configured correctly:

**Backend Configuration**:
- `APP_FRONTEND_URL`: **MUST** be set to your production frontend URL (e.g., `https://your-frontend-url.onrender.com`)
  - Without this, reset emails will contain `localhost` links that won't work in production
  - This is checked at runtime and logged; search logs for `[PASSWORD RESET]` to debug
- Email credentials (`SPRING_MAIL_*`) must be configured for emails to send
  - Test by requesting a password reset; logs will show the generated link

**Frontend Configuration**:
- `VITE_API_BASE_URL`: Must match the backend URL for API calls to work
- The reset link format is: `https://your-frontend-url.onrender.com/reset-password?token=<token>`
- Users click this link to open the reset form in their browser

**Verification Steps After Deployment**:
1. Test forgot-password endpoint: `POST /api/auth/forgot-password` with a test email
2. Check backend logs for `[PASSWORD RESET]` entries - you'll see the generated link
3. Verify the link contains your production domain, not `localhost`
4. Verify password reset and login work end-to-end
5. Check email logs if emails aren't arriving (Gmail requires app-specific passwords)
