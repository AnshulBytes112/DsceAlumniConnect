# Frontend API Centralization Guide

## Overview

The project now provides a centralized Axios-based API client (`apiClient.ts`) that replaces repetitive `fetch()` calls with a professional, interceptor-enabled HTTP client.

## Benefits

✅ **Automatic Token Management**: JWT tokens automatically attached to all requests  
✅ **Consistent Error Handling**: Global error interceptor catches all failures  
✅ **401 Handling**: Automatically logs out and redirects on authentication failure  
✅ **Type Safety**: Full TypeScript support with interfaces  
✅ **Reduced Code**: Eliminates repetitive try-catch and header management  
✅ **Better Testing**: Mockable service layer  

## New Architecture

```
Component
    ↓
Service Layer (AuthService, EventsService, etc.)
    ↓
apiClient (Axios instance with interceptors)
    ↓
Interceptors:
  - Add JWT token to all requests
  - Handle 401 Unauthorized (logout + redirect)
  - Handle other errors consistently
    ↓
Backend API
```

## Migration Guide

### Before (Old fetch-based approach):
```typescript
// Old way - repetitive and error-prone
const token = localStorage.getItem('jwtToken');
const headers: HeadersInit = {
  'Content-Type': 'application/json',
};
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}

const response = await fetch(`${API_BASE_URL}/events`, {
  headers,
});

if (!response.ok) {
  throw new Error('Failed to fetch events');
}

const data = await response.json();
```

### After (New Axios service approach):
```typescript
// New way - clean and consistent
import { EventsService } from '@/services/authService';

const events = await EventsService.getAllEvents();
```

## Installation

Axios needs to be added to dependencies:

```bash
npm install axios
# or
yarn add axios
# or  
pnpm add axios
```

## Usage Examples

### Authentication Service

```typescript
import { AuthService } from '@/services/authService';

// Sign up
const user = await AuthService.signup({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'secure-password',
});

// Login
const authResponse = await AuthService.login({
  email: 'john@example.com',
  password: 'secure-password',
});

// Store token
localStorage.setItem('jwtToken', authResponse.jwtToken);

// Google OAuth
const googleResponse = await AuthService.googleLogin({
  accessToken: googleAccessToken,
});

// Verify token
const isValid = await AuthService.verifyToken();

// Logout
AuthService.logout();
```

### Events Service

```typescript
import { EventsService } from '@/services/authService';

// Get all events
const events = await EventsService.getAllEvents();

// Get featured events
const featured = await EventsService.getFeaturedEvents();

// Create event (requires auth)
const newEvent = await EventsService.createEvent({
  id: '',
  title: 'Alumni Meetup',
  description: 'Annual alumni meetup',
  starttime: '2026-08-15T10:00:00Z',
  endtime: '2026-08-15T14:00:00Z',
  location: 'Conference Hall A',
  category: 'Networking',
  maxParticipants: 100,
});

// RSVP to event
await EventsService.rsvpEvent(eventId, 'GOING');

// Get specific event
const event = await EventsService.getEventById(eventId);
```

### Dashboard Service

```typescript
import { DashboardService } from '@/services/authService';

// Get stats
const stats = await DashboardService.getStats();
console.log(`Jobs applied: ${stats.jobsApplied}`);

// Get job applications
const applications = await DashboardService.getJobApplications();
```

### Direct API Client Usage (for custom requests)

```typescript
import apiClient from '@/services/apiClient';

// GET request
const data = await apiClient.get('/custom-endpoint');

// POST request
const response = await apiClient.post('/custom-endpoint', { /* data */ });

// PUT request
const updated = await apiClient.put('/custom-endpoint', { /* data */ });

// DELETE request
await apiClient.delete('/custom-endpoint');
```

## Error Handling

### Automatic (handled by interceptor):
- **401 Unauthorized**: Redirects to login
- **403 Forbidden**: Logs error
- **404 Not Found**: Logs error
- **400 Bad Request**: Logs error
- **Network Errors**: Logs error

### Manual Error Handling:
```typescript
import { EventsService } from '@/services/authService';
import { AxiosError } from 'axios';

try {
  const events = await EventsService.getAllEvents();
} catch (error) {
  if (error instanceof AxiosError) {
    console.error('API Error:', error.response?.status, error.response?.data);
  } else {
    console.error('Error:', error);
  }
}
```

## Creating New Services

When adding new API endpoints, create a service class:

```typescript
// src/services/jobsService.ts
import apiClient, { handleApiError } from './apiClient';
import { AxiosError } from 'axios';

export interface JobDTO {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
}

export class JobsService {
  static async getAllJobs(): Promise<JobDTO[]> {
    try {
      const response = await apiClient.get<JobDTO[]>('/jobs');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to fetch jobs: ${errorMessage}`);
    }
  }

  static async createJob(job: Omit<JobDTO, 'id'>): Promise<JobDTO> {
    try {
      const response = await apiClient.post<JobDTO>('/jobs', job);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to create job: ${errorMessage}`);
    }
  }
}
```

## Token Management

### Automatic Token Attachment
Tokens are automatically attached to all requests via the request interceptor. Just store the token after login:

```typescript
const authResponse = await AuthService.login(credentials);
localStorage.setItem('jwtToken', authResponse.jwtToken);
// All subsequent requests will include the token
```

### Token Refresh (Future Enhancement)
To implement token refresh on 401, modify the response interceptor:

```typescript
// In apiClient.ts interceptor
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  
  // Attempt to refresh token
  const refreshToken = localStorage.getItem('refreshToken');
  const newToken = await apiClient.post('/auth/refresh', { refreshToken });
  localStorage.setItem('jwtToken', newToken.data.jwtToken);
  
  originalRequest.headers.Authorization = `Bearer ${newToken.data.jwtToken}`;
  return apiClient(originalRequest);
}
```

## React Hook Integration

### With React Query:
```typescript
import { useQuery } from '@tanstack/react-query';
import { EventsService } from '@/services/authService';

function EventsList() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => EventsService.getAllEvents(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* render events */}</div>;
}
```

### With useState:
```typescript
import { useState, useEffect } from 'react';
import { EventsService } from '@/services/authService';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    EventsService.getAllEvents()
      .then(setEvents)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* render events */}</div>;
}
```

## Migration Checklist

- [ ] Install axios: `npm install axios`
- [ ] Review `apiClient.ts` for configuration
- [ ] Review example services in `authService.ts`
- [ ] Create service classes for other endpoints
- [ ] Replace fetch calls in components with service methods
- [ ] Test authentication flow (login/logout)
- [ ] Test token attachment to requests
- [ ] Test 401 error handling
- [ ] Update component tests to mock services
- [ ] Remove old API code from `api.ts` after migration

## Troubleshooting

### Token Not Attached to Requests
Ensure token is stored in `localStorage` with key `jwtToken`:
```typescript
localStorage.setItem('jwtToken', token);
```

### CORS Errors
CORS is configured on the backend. Ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL.

### 401 Redirects Infinitely
Check that the `/auth/verify` endpoint exists and is accessible. Modify the interceptor as needed.

### Axios Instance Not Available
Ensure `apiClient` is imported correctly:
```typescript
import apiClient from '@/services/apiClient';
```
