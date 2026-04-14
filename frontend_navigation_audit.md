# AlumniConnect Frontend Navigation Audit

This document provides a comprehensive overview of all webpages, user roles, and navigation flows within the AlumniConnect application. This serves as a reference for the upcoming navigation UI refactor.

## 👥 User Roles & Access Levels

| Role | Description | Access Level |
| :--- | :--- | :--- |
| **Guest** | Non-authenticated user. | Public pages only (Landing, Login, Register, Alumni Directory, Gallery). |
| **Pending Alumni** | Authenticated but waiting for admin approval. | Redirected to `/verification-pending`. Limited access. |
| **Approved Alumni** | Authenticated and verified by Admin. | Full access to community features (Dashboard, Events, Jobs, Forums, etc.). |
| **Admin** | System administrator. | Full access + Admin Management tools (Verification, Analytics, Event Management). |

---

## 🗺️ Webpage Directory

### 🔓 Public Pages (Accessible to All)
These pages are accessible without logging in.

| Page | Route | Description | Currently in Navbar? |
| :--- | :--- | :--- | :--- |
| **Landing** | `/` or `/landing` | Main marketing/introduction page with high-level stats. | Yes (Home) |
| **Login** | `/login` | User authentication page. | Yes (if logged out) |
| **Register** | `/register` | New account creation. | Yes (if logged out) |
| **Forgot Password** | `/forgot-password` | Password recovery initiation. | No |
| **Verify OTP** | `/verify-otp` | OTP verification for password reset or registration. | No |
| **Alumni Directory** | `/alumni` | Searchable list of all registered alumni. | Yes |
| **Alumni Profile** | `/alumni/:id` | Public view of an alumnus's profile. | No (Linked from list) |
| **Gallery** | `/gallery` | Photo gallery of college/alumni events. | Yes |

### 🔒 Protected Pages (Approved Alumni Only)
These require authentication. Users with `PENDING` or `REJECTED` status are redirected away from these.

| Page | Route | Description | Currently in Navbar? |
| :--- | :--- | :--- | :--- |
| **Home (Authenticated)** | `/home` | Main feed/dashboard for authenticated users. | No (Redirect from Auth) |
| **Dashboard** | `/dashboard` | User overview, stats, and quick links. | Yes |
| **My Profile** | `/dashboard/profile` | Personal profile view. | Yes |
| **Edit Profile** | `/dashboard/profile/edit-profile` | Complete profile management interface. | No |
| **Events** | `/dashboard/events` | List of upcoming and past events. | Yes |
| **Event Details** | `/dashboard/events/:id` | Detailed view of a specific event with RSVP options. | No (Linked from list) |
| **Announcements** | `/dashboard/announcements` | Official college/alumni announcements. | No (In Sidebar) |
| **Community Posts** | `/dashboard/posts` | Social feed for alumni discussions. | Yes |
| **Job Board** | `/jobs` | Career opportunities posted by alumni or admins. | Yes |
| **Job Details** | `/jobs/:id` | Full job description and application details. | No (Linked from list) |
| **Settings** | `/dashboard/settings` | Account and notification settings. | No (In Sidebar) |
| **Forums** | `/dashboard/forums` | Discussion groups/categories. | No (In Sidebar) |
| **Forum Detail** | `/dashboard/forums/:groupId` | Topics within a specific forum group. | No |
| **Topic Detail** | `/dashboard/forums/:groupId/topics/:id` | Specific discussion thread. | No |

### 🛠️ Administrative Pages (Admin Role Only)
These pages are only accessible to users with the `ADMIN` role.

| Page | Route | Description | Currently in Navbar? |
| :--- | :--- | :--- | :--- |
| **Admin Verification** | `/admin/verification` | Interface to approve/reject pending alumni. | No (In Sidebar) |
| **Analytics** | `/admin/analytics` | System usage and data visualization. | No (In Sidebar) |
| **Alumni Management** | `/admin/alumni` | Search and manage all alumni records. | No (In Sidebar) |
| **Event Management** | `/admin/events` | Create, edit, and feature events. | No (In Sidebar) |
| **Announcement Manager**| `/admin/manager` | Manage official announcements. | No |

---

## 🔄 User Flows & Logic

### 1. Onboarding Flow
`Register` ➔ `Verify OTP` ➔ `Login` ➔ `Profile Setup` (if incomplete) ➔ `Verification Pending` ➔ *(Wait for Admin)* ➔ `Approved` ➔ `Dashboard`.

### 2. Authentication Guards (`ProtectedRoute.tsx`)
- **Unauthenticated:** Any attempt to access `/dashboard/*`, `/jobs/*`, or `/home` redirects to `/`.
- **Pending/Rejected:** Any access attempt (except `/`) redirects to `/verification-pending`.
- **Incomplete Profile:** If `profileComplete` is false, users are nudged/redirected to `/profile-setup` when accessing certain dashboard areas.

### 3. Admin Guard (`AdminRoute.tsx`)
- Validates both `isAuthenticated` and `user.role === 'ADMIN'`.
- Non-admins attempting to access `/admin/*` are redirected to `/dashboard`.

---

## 🔍 Navigation Gaps
The following pages are currently **NOT** easily accessible from the main `PillNav` or `Sidebar` based on `App.tsx`:
1.  **Announcement Manager**: Route exists but isn't explicitly linked in the main sidebar.
2.  **Edit Profile**: Usually reached via the Profile page, but could be a direct link in a user menu.
3.  **Specific Forums/Topics**: Deep links that are only reachable via navigation from the Forum list.
4.  **OTP/Password Recovery**: Context-specific pages not needed in general navigation.

## 💡 Refactor Suggestions
- **Role-Based Menus**: Explicitly separate Admin tools from User tools.
- **Verification Awareness**: Navigation should be disabled or "locked" for pending users.
- **Deep Linking**: Ensure breadcrumbs or a recursive sidebar handle Forums/Topics and Event/Job details.
- **User Profile Menu**: Use the avatar as a dropdown for `My Profile`, `Edit Profile`, `Settings`, and `Logout`.
