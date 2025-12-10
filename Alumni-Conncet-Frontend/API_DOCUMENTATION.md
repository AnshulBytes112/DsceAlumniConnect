# DSCE Alumni Connect - API Documentation

## Base URL
```
http://localhost:8080
```

## Authentication
All API endpoints (except auth endpoints) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Authentication

#### POST /auth/signup
Register a new user account.

**Request Body:**
```typescript
interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
```

**Response:**
```typescript
interface AuthResponse extends UserProfile {
  jwtToken: string;
}
```

**Example:**
```javascript
const response = await apiClient.signup({
  email: "user@example.com",
  password: "password123",
  firstName: "John",
  lastName: "Doe"
});
```

#### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response:**
```typescript
interface AuthResponse extends UserProfile {
  jwtToken: string;
}
```

**Example:**
```javascript
const response = await apiClient.login({
  email: "user@example.com",
  password: "password123"
});
```

#### POST /auth/google
Authenticate with Google OAuth.

**Request Body:**
```typescript
interface GoogleSignInRequest {
  token: string; // Google OAuth token
}
```

**Response:**
```typescript
interface AuthResponse extends UserProfile {
  jwtToken: string;
}
```

### Profile Management

#### GET /profile
Get current user's profile information.

**Response:**
```typescript
interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  headline?: string;
  profileComplete: boolean;
  profilePicture?: string;
  resumeUrl?: string;
}
```

**Example:**
```javascript
const profile = await apiClient.getProfile();
```

#### POST /profile/setup
Setup user profile with optional file uploads.

**Request Body:** (multipart/form-data)
- `data`: JSON string with profile data
- `profile`: Profile picture file (optional)
- `resume`: Resume file (optional)

**Example:**
```javascript
const response = await apiClient.setupProfile({
  profileData: {
    headline: "Software Engineer",
    bio: "Experienced developer..."
  },
  profilePicture: file,
  resume: file
});
```

#### PUT /profile
Update user profile information.

**Request Body:**
```typescript
interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  headline?: string;
  bio?: string;
}
```

**Example:**
```javascript
const response = await apiClient.updateProfile({
  headline: "Senior Software Engineer",
  bio: "Updated bio..."
});
```

#### POST /profile/resume
Upload or update resume file.

**Request Body:** (multipart/form-data)
- `file`: Resume file
- `replaceExisting`: boolean query parameter

**Example:**
```javascript
const response = await apiClient.uploadResume(resumeFile, true);
```

### Dashboard Data

#### GET /dashboard/stats
Get dashboard statistics for current user.

**Response:**
```typescript
interface DashboardStats {
  jobsApplied: number;
  events: number;
  mentorships: number;
}
```

**Example:**
```javascript
const stats = await apiClient.getDashboardStats();
```

#### GET /dashboard/announcements
Get system announcements.

**Response:**
```typescript
interface Announcement {
  id: number;
  title: string;
  description: string;
  time: string;
}
```

**Example:**
```javascript
const announcements = await apiClient.getAnnouncements();
```

#### GET /dashboard/job-applications
Get user's job application history.

**Response:**
```typescript
interface JobApplication {
  company: string;
  role: string;
  status: 'Applied' | 'Interview' | 'Rejected';
  date: string;
}
```

**Example:**
```javascript
const applications = await apiClient.getJobApplications();
```

#### GET /dashboard/events
Get upcoming events for user.

**Response:**
```typescript
interface Event {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
}
```

**Example:**
```javascript
const events = await apiClient.getUpcomingEvents();
```

#### GET /dashboard/fundings
Get project funding information.

**Response:**
```typescript
interface ProjectFunding {
  title: string;
  amount: string;
  status: 'Approved' | 'Pending' | 'In Review';
  date: string;
}
```

**Example:**
```javascript
const fundings = await apiClient.getProjectFundings();
```

### Events

#### GET /events
Get all events.

**Response:**
```typescript
interface EventDTO {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
  userRsvpStatus?: 'GOING' | 'MAYBE' | 'NOT_GOING' | null;
}
```

**Example:**
```javascript
const events = await apiClient.getAllEvents();
```

#### POST /events
Create a new event.

**Request Body:**
```typescript
interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
}
```

**Example:**
```javascript
const event = await apiClient.createEvent({
  title: "Alumni Meetup",
  description: "Networking event for DSCE alumni",
  date: "2024-12-15",
  time: "18:00",
  location: "DSCE Campus"
});
```

#### POST /events/{eventId}/rsvp
Update RSVP status for an event.

**Request Body:**
```typescript
interface RsvpRequest {
  status: 'GOING' | 'MAYBE' | 'NOT_GOING';
}
```

**Example:**
```javascript
await apiClient.rsvpEvent("event-123", "GOING");
```

## Error Handling

All API endpoints return consistent error responses:

```typescript
interface ErrorResponse {
  message: string;
  status: number;
  errors?: any;
}
```

## Usage Examples

### Complete Authentication Flow
```javascript
// 1. Login
const authResponse = await apiClient.login({
  email: "user@example.com",
  password: "password123"
});

// 2. Store JWT token
localStorage.setItem('jwtToken', authResponse.jwtToken);

// 3. Get user profile
const profile = await apiClient.getProfile();

// 4. Get dashboard data
const [stats, announcements, applications] = await Promise.all([
  apiClient.getDashboardStats(),
  apiClient.getAnnouncements(),
  apiClient.getJobApplications()
]);
```

### Profile Setup with Files
```javascript
const profileData = {
  firstName: "John",
  lastName: "Doe",
  headline: "Software Engineer"
};

const profilePicture = new File(["..."], "profile.jpg", { type: "image/jpeg" });
const resume = new File(["..."], "resume.pdf", { type: "application/pdf" });

await apiClient.setupProfile({
  profileData,
  profilePicture,
  resume
});
```

## Configuration

The API base URL can be configured at runtime:

```javascript
import { setApiBaseUrl } from '@/lib/api';

// Change base URL if needed
setApiBaseUrl('https://api.example.com');
```

## Notes

- All authenticated endpoints require a valid JWT token
- Tokens are stored in localStorage under 'jwtToken' key
- File uploads use multipart/form-data format
- 404 errors for list endpoints return empty arrays
- All timestamps are in string format
- Error messages are descriptive and include HTTP status when available
