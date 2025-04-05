# 🚀 Express TypeScript Starter

A modern and scalable Express.js backend project built with **TypeScript**, featuring out-of-the-box **authentication**. Designed to be a clean and extensible foundation for new backend projects — perfect for startups and production-grade apps.

---

## ✨ Features

- ✅ **Authentication** (Session-Based)
- ⚙️ Built with **TypeScript** for type safety
- 📁 Scalable and modular **project structure**
- 📦 Lightweight and dependency-minimal
- 🛡️ Basic security best practices
- 🧪 Easily testable with unit and integration support

---

## 📁 Project Structure

```bash
src/
├── core/                 # Core logic and utilities 
│   └── database/         # Database configuration
│       └── postgres.ts
│       └── redis.ts
├── features/
│   └── auth/             # Authentication module
│       └── README.md     # Docs for auth feature
├── tests/                # Test files based on feature module
└── index.ts              # Entry point of the app
```

## 🧑‍💻 Getting Started

### 1. **Clone the Repository**
**`git clone https://github.com/xVelkow/Express-Typescript-Starter.git`**

**`cd Express-Typescript-Starter`**

### 2. **Install Dependencies**
**`npm install`**

### 3. **Create an .env file**
Rename **`example.env`** to **`.env`**

### 4. **Generate and Migrate using DrizzleORM**
**`npx drizzle-kit generate`**

**`npx drizzle-kit migrate`**

### 5. **Run the Project**
**`npm run dev`**

## 🔐 Authentication

The authentication module is preconfigured with the basics:

- Register / Login / Logout
- Session-based storage using Redis
- Custom middleware to protect routes

📄 Learn more in **`src/features/auth/README.md`**

## 🤝 Contributing

If you're using this as a base or extending it, feel free to fork and contribute!

## 💡 Inspiration
Built to save time when starting new Express projects with repetitive setup.
