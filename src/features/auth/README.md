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

### 1. **POST /api/auth/login - Missing Credentials**
Tests if the login request returns a 401 error when credentials are missing.

### 2. **POST /api/auth/login - Invalid Credentials**
Tests if the login request returns a 401 error when invalid credentials are provided.

### 3. **POST /api/auth/login - Invalid Password**
Tests if the login request returns a 401 error when the password is incorrect.

### 4. **POST /api/auth/login - Valid Credentials with Username**
Tests if the login request returns a 200 status for valid credentials using a username.

### 5. **POST /api/auth/login - Valid Credentials with Email**
Tests if the login request returns a 200 status for valid credentials using an email.

### 6. **POST /api/auth/logout - Successful Logout**
Tests if the logout functionality works correctly.

### 7. **POST /api/auth/login - Null Credentials**
Tests for null values in credentials and ensures that they return a proper error.

### 8. **POST /api/auth/login - Should Set Session Cookie**
Tests if the session cookie is set on successful login.
