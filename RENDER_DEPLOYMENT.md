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
    *   `JWT_SECRET`: A long random string.
    *   `PORT`: `8080` (Render will automatically route traffic here).
    *   `CORS_ALLOWED_ORIGINS`: `https://your-frontend-url.onrender.com` (Add after frontend is created).
    *   `APP_BASE_URL`: `https://your-backend-url.onrender.com`.
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
