# Authentication Feature

The **Authentication Feature** ensures secure user authentication for the platform. It provides essential functionalities such as user registration, login, and logout using standard authentication methods. This feature leverages **Passport.js** and **Redis** to manage sessions and handle user credentials securely.

## Table of Contents
- [Overview](#overview)
- [Used Packages](#used-packages)
- [API Endpoints](#api-endpoints)
  - [POST /api/auth/register](#post-apiauthregister)
  - [POST /api/auth/login](#post-apiauthlogin)
  - [POST /api/auth/logout](#post-apiauthlogout)
- [Tests](#tests)

## Overview

This feature provides authentication mechanisms to allow users to sign up, log in, and log out securely. It handles:
- Password hashing with **bcryptjs** to ensure that passwords are not stored in plain text.
- Sessions are stored in **Redis** using **ioredis** and **express-session** to maintain user authentication state across multiple requests.
- Authentication is performed using **Passport.js** and the **passport-local** strategy, allowing login through username/email and password.

## Used Packages

The following packages are used to implement and manage authentication:

- **passport**: A powerful authentication middleware for Node.js.
- **passport-local**: A strategy for authenticating users using a username and password.
- **ioredis**: A Redis client to store and manage session data.
- **express-session**: A session middleware for managing user sessions.
- **bcryptjs**: A library to hash and compare passwords securely.
- **dotenv**: A module to load environment variables from a `.env` file.
- **jest**: A testing framework for unit tests.
- **supertest**: A module for making HTTP assertions for testing.

## API Endpoints

### 1. **POST /api/auth/register**
Registers a new user with a username, email, and password (only if unauthenticated).

#### Request Body
```json
{
  "username": "testuser",
  "email": "testuser@test.com",
  "password": "testpassword"
}
```

### 2. **POST /api/auth/login**
Logs a user in with usernameOrEmail and password and saves his session in Redis (only if unauthenticated).

#### Request Body
```json
{
  "usernameOrEmail": "testuser",
  "password": "testpassword"
}
```
or
```json
{
  "usernameOrEmail": "testuser@test.com",
  "password": "testpassword"
}
```

### 3. **POST /api/auth/logout**
Logs a user out and removes his session from Redis (only if authenticated).

### 4. **GET /api/auth/current**
Retrieves the current logged in user (only if authenticated).

## Tests
The following tests are designed to ensure the correctness of the authentication feature.

### **Authentication API**

#### 1. Login Endpoint

##### Invalid Login Scenarios
- ✓ **Empty credentials:** Returns 401 Unauthorized with "Missing credentials" message
- ✓ **Null credentials:** Returns 401 Unauthorized with "Missing credentials" message
- ✓ **Undefined credentials:** Returns 401 Unauthorized with "Missing credentials" message
- ✓ **Invalid username and password:** Returns 401 Unauthorized with "Invalid credentials" message
- ✓ **Valid username with wrong password:** Returns 401 Unauthorized with "Invalid credentials" message
- ✓ **Valid email with wrong password:** Returns 401 Unauthorized with "Invalid credentials" message

##### Valid Login Scenarios
- ✓ **Username login:** Returns 200 OK with user data (excluding password) when using valid username
- ✓ **Email login:** Returns 200 OK with user data (excluding password) when using valid email
- ✓ **Session cookie:** Sets proper HttpOnly session cookie on successful authentication

#### 2. Logout Endpoint
- ✓ **Successful logout:** Returns 200 OK with "User logged out successfully" message
- ✓ **Cookie clearing:** Properly expires the session cookie (sets expiry to Jan 1, 1970)

#### 3. Session Management
- ✓ **Unauthenticated access:** Returns 401 Unauthorized when accessing protected routes without authentication
- ✓ **Authenticated access:** Returns 200 OK with user data when accessing protected routes with valid session
- ✓ **Invalid session:** Returns 401 Unauthorized when session is invalid or expired

#### 4. Password Security
- ✓ **Password protection:** Ensures password/hashedPassword fields are never included in API responses

### Test Environment
- Uses isolated test user created specifically for testing
- Cleans up sessions after each test
- Properly disconnects from Redis and closes server after all tests complete