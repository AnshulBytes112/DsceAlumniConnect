# Alumni Verification System

## Overview
This system implements a complete alumni verification workflow with admin approval process.

## Features

### 1. College Email Verification
- Supports `@dsce.edu.in` domain for college emails
- Also accepts personal emails (`@gmail.com`, `@yahoo.com`, etc.)
- All emails go through admin verification

### 2. LinkedIn Profile Verification (Optional)
- Alumni can optionally provide their LinkedIn profile URL
- URL validation ensures it's a valid LinkedIn profile
- Admins can view LinkedIn profiles during verification

### 3. Admin Verification Dashboard
- **URL**: `/dashboard/verification` (only for admin users)
- **Admin Credentials**: 
  - Email: `test@example.com`
  - Password: `password123`

#### Features:
- View all pending verification requests
- Search by name, email, or department
- Filter by status (pending, approved, rejected)
- Approve or reject requests with one click
- View LinkedIn profiles
- See application timestamps
- Real-time stats (pending, approved, rejected counts)

### 4. Pending Verification Page
- **URL**: `/pending-verification`
- Shown to users after registration
- Displays their information
- Shows verification timeline
- Explains next steps

## User Flow

### Registration Flow
1. User visits `/register`
2. Fills in details including optional LinkedIn URL
3. Submits registration
4. Redirected to `/pending-verification` page
5. Admin reviews and approves/rejects the request
6. User receives email notification (when backend is connected)

### Admin Flow
1. Admin logs in with `test@example.com` / `password123`
2. Navbar shows "Verification" link
3. Admin visits `/dashboard/verification`
4. Reviews pending requests
5. Approves or rejects requests
6. Request status updates in real-time

## File Structure

```
src/
├── data/
│   └── verificationData.ts      # Mock data & types
├── pages/
│   ├── AdminVerification.tsx    # Admin dashboard
│   ├── PendingVerification.tsx  # User waiting page
│   └── Register.tsx             # Updated registration
├── components/
│   └── layout/
│       └── GlobalNavbar.tsx     # Updated navbar
└── App.tsx                      # Routes configuration
```

## API Endpoints (For Backend Team)

### GET `/api/alumni/pending`
Get all pending verification requests
```json
[
  {
    "id": "1",
    "firstName": "Rahul",
    "lastName": "Kumar",
    "email": "rahul.kumar@dsce.edu.in",
    "linkedinUrl": "https://linkedin.com/in/rahulkumar",
    "graduationYear": 2024,
    "department": "Computer Science",
    "appliedAt": "2024-01-15T10:30:00Z",
    "status": "pending"
  }
]
```

### POST `/api/alumni/verify/:id`
Approve a verification request

### DELETE `/api/alumni/reject/:id`
Reject a verification request

### POST `/api/alumni/register`
Register new alumni (with verification status)

## Testing

### Test Admin Access
1. Login with `test@example.com` / `password123`
2. Check navbar for "Verification" link
3. Visit `/dashboard/verification`

### Test User Registration
1. Go to `/register`
2. Fill in details
3. Note the LinkedIn URL field (optional)
4. Submit and see pending page

## Environment Variables

No additional environment variables required for frontend-only mode.

For backend integration, create `.env`:
```env
VITE_API_PROXY_URL=http://127.0.0.1:8080
```

## Current Status

✅ **Frontend Complete**
- Admin dashboard with full functionality
- Pending verification page
- LinkedIn URL field in registration
- Admin-only navbar link
- Mock data for testing

🔄 **Backend Pending**
- API endpoints need to be implemented
- Database schema for verification requests
- Email notification system

## Notes

- Currently uses mock data for demonstration
- All data resets on page refresh (until backend is connected)
- Admin credentials are for testing only - should be changed in production
- LinkedIn profile verification is optional
- Supports both college and personal email domains

