# SSR E-Commerce Backend — Authentication & Setup

A secure SSR e-commerce backend using Node.js, Express, EJS, and MongoDB with advanced session-based authentication.

## Features

- ✅ Session-based authentication (NO JWT, NO Passport.js)
- ✅ MongoDB-backed sessions with connect-mongo
- ✅ Role-based access control (user, admin)
- ✅ Device + IP session tracking
- ✅ CSRF protection
- ✅ Rate limiting on login routes
- ✅ Password hashing with bcrypt (≥12 rounds)
- ✅ Session invalidation on password change
- ✅ Multi-device session management
- ✅ SSR with EJS templates
- ✅ Security headers with Helmet
- ✅ Compression middleware

## Tech Stack

### Core

- Node.js
- Express
- EJS
- MongoDB (Mongoose)

### Auth & Sessions

- express-session
- connect-mongo
- bcrypt

### Security

- helmet
- csurf
- express-rate-limit
- cookie-parser
- compression

## Project Structure

```bash
src/
  server.js              # Entry point
  app.js                 # Express app setup
  
  config/
    env.js               # Environment configuration
    db.js                # MongoDB connection
    session.js           # Session configuration
  
  models/
    User.model.js        # User schema
    UserSession.model.js # Session tracking schema
  
  routes/
    index.routes.js      # Public routes
    auth.routes.js       # Authentication routes
    admin.routes.js      # Admin routes
  
  controllers/
    auth.controller.js   # Auth logic
    admin.controller.js  # Admin logic
  
  services/
    auth.service.js      # Auth business logic
    session.service.js   # Session management
  
  middlewares/
    requireAuth.js       # Auth middleware
    requireRole.js       # Role-based middleware
    guestOnly.js         # Guest-only middleware
    csrf.js              # CSRF protection
    locals.js            # Template locals
  
  views/
    layouts/             # EJS layouts
    auth/                # Auth pages
    admin/               # Admin pages
    home.ejs             # Home page
```

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:

   ```bash
   DATABASE_URL=your_mongodb_connection_string
   NODE_ENV=development
   PORT=3000
   SESSION_SECRET=your-super-secret-session-key
   ```

## Running the Application

### Development mode (with auto-reload)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## Session Configuration

- Cookie name: `sid`
- Store: MongoDB (connect-mongo)
- Cookie settings:
  - httpOnly: true
  - sameSite: "lax"
  - secure: true (production only)
  - maxAge: 7 days

## Authentication Flow

### Register

1. Validate input
2. Hash password with bcrypt (12 rounds)
3. Create user in database
4. Redirect to login

### Login

1. Validate credentials
2. Compare password with bcrypt
3. Create express session
4. Create UserSession record (tracks device, IP, etc.)
5. Redirect based on role

### Logout (Single Device)

- Destroy express session
- Revoke UserSession in database

### Logout (All Devices)

- Revoke all UserSessions for user
- Destroy current session

## Security Features

1. **CSRF Protection**: All POST routes protected with CSRF tokens
2. **Rate Limiting**: Login route limited to 5 attempts per 15 minutes
3. **Password Security**: Bcrypt with 12+ salt rounds
4. **Session Validation**:
   - Checks if session exists
   - Validates UserSession in database
   - Verifies user is active
   - Invalidates session if password changed
5. **Security Headers**: Helmet middleware for HTTP security headers
6. **HTTP-Only Cookies**: Prevents XSS attacks

## Routes

### Public Routes

- `GET /` - Home page

### Auth Routes

- `GET /auth/register` - Registration page
- `POST /auth/register` - Register new user
- `GET /auth/login` - Login page
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout current device
- `POST /auth/logout-all` - Logout all devices

### Admin Routes

- `GET /admin/dashboard` - Admin dashboard (requires admin role)

## Data Models

### User Model

```javascript
{
  email: String (unique)
  passwordHash: String
  role: 'user' | 'admin'
  status: 'active' | 'disabled'
  passwordChangedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

### UserSession Model

```javascript
{
  userId: ObjectId
  sessionId: String (unique)
  ip: String
  userAgent: String
  device: { browser, os }
  location: { country, city }
  createdAt: Date
  lastSeenAt: Date
  revokedAt: Date
  isRevoked: Boolean
}
```
