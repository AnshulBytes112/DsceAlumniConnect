# Forgot Password Feature - Testing & Verification Guide

## Root Causes Fixed

### Issue 1: Localhost Hardcoding in Reset Links ✅ FIXED

**Root Cause**: 
- `APP_FRONTEND_URL` environment variable was not documented in Render deployment guide
- Production deployments fell back to default `http://localhost:5173`
- Reset emails contained invalid localhost links

**Solution Implemented**:
1. Created `application-prod.properties` with proper configuration management
2. Updated `RENDER_DEPLOYMENT.md` with explicit `APP_FRONTEND_URL` requirement
3. Enhanced logging to show configured frontend URL at runtime
4. Added verification steps in deployment guide

**Files Modified**:
- ✅ `backend/src/main/resources/application-prod.properties` (NEW)
- ✅ `backend/src/main/resources/application-dev.properties` (NEW)
- ✅ `RENDER_DEPLOYMENT.md` (Updated with APP_FRONTEND_URL)
- ✅ `backend/src/main/java/com/dsce/AlumniConnect/Service/AuthService.java` (Enhanced logging)

**Verification**:
```bash
# Check logs for this message with correct domain:
# [PASSWORD RESET] Frontend URL configured as: https://your-production-domain
```

---

### Issue 2: Password Reset Succeeds But Login Fails ✅ FIXED

**Root Cause**:
- `resetPassword()` method not marked as `@Transactional`
- No verification that saved password hash could be validated
- No comprehensive logging to diagnose the issue
- `DaoAuthenticationProvider` using non-standard constructor initialization

**Solutions Implemented**:

1. **Added @Transactional to resetPassword()**
   - Ensures MongoDB save operation commits
   - Prevents partial/uncommitted writes

2. **Added Password Verification Before Success**
   - After saving new password, verifies it with `passwordEncoder.matches()`
   - If verification fails, throws error and prevents silent failure
   - This catches encoding/verification mismatches immediately

3. **Comprehensive Debug Logging**
   - Logs every step of password reset flow
   - Logs password hash verification status
   - All logs prefixed with `[PASSWORD RESET]` for easy filtering

4. **Fixed DaoAuthenticationProvider Initialization**
   - Changed from: `new DaoAuthenticationProvider(userDetailsService)`
   - Changed to: Standard constructor + explicit `setUserDetailsService()` and `setPasswordEncoder()`
   - Ensures proper initialization per Spring Security standards

**Files Modified**:
- ✅ `backend/src/main/java/com/dsce/AlumniConnect/Service/AuthService.java`
  - Added `@Transactional` import and annotation
  - Added comprehensive logging (14 log statements)
  - Added password verification validation
- ✅ `backend/src/main/java/com/dsce/AlumniConnect/config/SpringSecurity.java`
  - Fixed DaoAuthenticationProvider initialization

---

## End-to-End Testing Checklist

### Pre-Deployment (Local Testing)

- [ ] **Database Access**
  - Verify MongoDB connection in `application.properties`
  - Verify database is accessible from your machine

- [ ] **Email Configuration**
  - Verify Gmail app password is correct in `application.properties`
  - Test SMTP credentials are valid

### Test Scenario 1: Complete Forgot Password Flow (Local)

```bash
# 1. Start backend
cd backend
./mvnw.cmd spring-boot:run

# 2. Start frontend
cd frontend
npm run dev
```

**Manual Testing**:
1. Open http://localhost:5173/login
2. Click "Forgot Password?"
3. Enter test email: `test@example.com`
4. Expected: Success message shown
5. Backend logs should show:
   ```
   [PASSWORD RESET] Token generated for test@example.com: <uuid>
   [PASSWORD RESET] Frontend URL configured as: http://localhost:5173
   [PASSWORD RESET] Reset link: http://localhost:5173/reset-password?token=<uuid>
   [PASSWORD RESET] Email sent successfully to test@example.com
   ```

- [ ] **Verification**: Logs show correct localhost URL for development

### Test Scenario 2: Reset Password & Login (Local)

1. Copy the reset link from logs (or email if SMTP works)
2. Open the reset link in browser: `http://localhost:5173/reset-password?token=<token>`
3. Enter new password: `NewPassword123`
4. Click "Reset Password"
5. Expected: Redirect to login, success message shown

**Backend Logs Expected**:
```
[PASSWORD RESET] Starting password reset process with token: <uuid>
[PASSWORD RESET] User found: test@example.com
[PASSWORD RESET] New password encoded for user: test@example.com
[PASSWORD RESET] User saved successfully: test@example.com
[PASSWORD RESET] Password verification successful for user: test@example.com
[PASSWORD RESET] Password reset completed successfully for test@example.com
```

- [ ] **Verification**: ALL password verification logs show success

### Test Scenario 3: Login After Password Reset (Local)

1. Go to http://localhost:5173/login
2. Enter email: `test@example.com`
3. Enter password: `NewPassword123` (the new password)
4. Click "Login"
5. Expected: Login succeeds, redirects to dashboard

- [ ] **Verification**: Dashboard loads, user authenticated

### Test Scenario 4: Old Password No Longer Works (Local)

1. Go to http://localhost:5173/login
2. Enter email: `test@example.com`
3. Enter OLD password (before reset)
4. Click "Login"
5. Expected: Login fails with "Invalid email or password"

- [ ] **Verification**: Old password rejected

### Test Scenario 5: Invalid/Expired Token (Local)

1. Open a reset link with invalid token: `http://localhost:5173/reset-password?token=invalid-token-123`
2. Try to submit reset password form
3. Expected: Error shown - "Invalid or expired reset token"

- [ ] **Verification**: Invalid token properly rejected

### Test Scenario 6: Token Reuse Prevention (Local)

1. Get a valid reset token (from logs or email)
2. Use it to reset password once (Test Scenario 2)
3. Try to use the same token again
4. Expected: Error - "Invalid or expired reset token"

- [ ] **Verification**: Token cannot be reused

---

## Production Deployment Testing

### Pre-Deployment Checklist

- [ ] Environment variables configured in Render:
  ```
  SPRING_DATA_MONGODB_URI=<your-mongodb-atlas-uri>
  JWT_SECRET=<your-jwt-secret>
  APP_FRONTEND_URL=https://your-frontend-url.onrender.com
  SPRING_MAIL_HOST=smtp.gmail.com
  SPRING_MAIL_PORT=587
  SPRING_MAIL_USERNAME=<your-email>
  SPRING_MAIL_PASSWORD=<your-app-password>
  CORS_ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
  SPRING_PROFILES_ACTIVE=prod
  ```

- [ ] Frontend URL environment variables configured:
  ```
  VITE_API_BASE_URL=https://your-backend-url.onrender.com
  ```

### Test Scenario 7: Production Frontend URL in Reset Link

1. In production backend logs, search for: `[PASSWORD RESET] Frontend URL configured as:`
2. Expected output: `[PASSWORD RESET] Frontend URL configured as: https://your-frontend-url.onrender.com`
3. NOT `http://localhost:5173`

- [ ] **Verification**: Production domain in logs, not localhost

### Test Scenario 8: Production Password Reset & Login Flow

1. Navigate to production frontend: `https://your-frontend-url.onrender.com/login`
2. Click "Forgot Password?"
3. Enter test email
4. Check email (or backend logs) for reset link
5. Expected: Reset link contains production domain
6. Click link, reset password, login
7. Expected: Full flow succeeds

- [ ] **Verification**: Production flow works end-to-end

---

## Debugging Guide

### Issue: Password Reset Returns Success But Login Fails

**Step 1: Check Logs for Password Verification Failure**
```bash
# Search for:
[PASSWORD RESET] Password verification FAILED after save
```
If found: Save operation succeeded, but encoded password cannot verify plaintext
- Possible cause: Password encoder configuration issue
- Solution: Check `PasswordEncoder` bean is same BCryptPasswordEncoder instance

**Step 2: Check Database Directly**
```javascript
// In MongoDB Atlas shell:
db.users.findOne({ email: "test@example.com" })
// Check password field
// Should be a bcrypt hash: $2a$ or $2b$...
```

**Step 3: Enable Extra Debug Logging**
Edit `application.properties`:
```properties
logging.level.com.dsce.AlumniConnect.Service.AuthService=TRACE
logging.level.org.springframework.security=DEBUG
```

### Issue: Frontend URL Still Shows Localhost in Production

**Step 1: Verify Environment Variable Set**
```bash
# Check Render dashboard > Web Service > Environment
# Verify APP_FRONTEND_URL is set correctly (not APP_FRONTEND_URL_DEV or similar)
```

**Step 2: Check Backend Logs**
Search for: `[PASSWORD RESET] Frontend URL configured as:`
- If shows localhost: Environment variable not passed correctly
- Solution: Restart Render deployment after setting environment variables

**Step 3: Verify SPRING_PROFILES_ACTIVE**
Search logs for profile name:
```
The following profiles are active: prod
```
If shows "default" instead of "prod": application-prod.properties not loaded

### Issue: Emails Not Arriving

**Step 1: Check SMTP Configuration**
```bash
# Logs should show:
[PASSWORD RESET] Email sent successfully to user@example.com
```
If not present:
- SMTP credentials incorrect
- Check `spring.mail.username` and `spring.mail.password` in environment variables

**Step 2: Gmail App Password**
- Must use app-specific password, NOT your Gmail password
- Generate at: https://myaccount.google.com/apppasswords
- Requires 2FA enabled

**Step 3: Check Logs for Mail Exceptions**
```
[PASSWORD RESET] Could not send reset email to ... Error: <error-message>
```

---

## Security Verification

- [ ] **Password Not Logged in Plaintext**
  - Verify no plaintext passwords appear in logs
  - Only password hashes (bcrypt format) should be visible

- [ ] **Token Not Reusable**
  - After reset, token is deleted from database
  - Attempting reuse returns "Invalid or expired reset token"

- [ ] **Token Expiration Enforced**
  - Token expires after 1 hour
  - Logs show: `[PASSWORD RESET] Token expired for user:`

- [ ] **Secure Password Encoding**
  - All passwords use BCryptPasswordEncoder (Spring Security standard)
  - Hash starts with `$2a$` or `$2b$` format

---

## Performance Verification

- [ ] **Password Reset Completes < 2 seconds** (local)
- [ ] **Password Reset Completes < 5 seconds** (production with SMTP)
- [ ] **Login after reset completes < 1 second**
- [ ] **No database/memory leaks** (token cleanup works)

---

## Sign-Off Checklist

- [ ] Issue 1 fixed: Frontend URL properly configurable for all environments
- [ ] Issue 2 fixed: Password reset succeeds and login works
- [ ] All 8 test scenarios pass
- [ ] Production deployment includes all required environment variables
- [ ] Logs show proper debugging information
- [ ] Security requirements met
- [ ] Performance acceptable

---

## Rollback Plan

If issues occur after deployment:

1. **Revert to Previous Image**
   ```bash
   # In Render > Web Service
   # Go to Deploys, select previous successful deployment
   # Click "Redeploy"
   ```

2. **Check Render Logs**
   - Render dashboard shows real-time logs
   - Search for `[PASSWORD RESET]` to debug

3. **Emergency Contact**
   - If production is down, immediately redeploy known-good version
   - Review changes in development before re-attempting production deploy
