# Setup Guide — Scripture Memory App

Complete setup instructions for local development.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Mobile App Setup](#mobile-app-setup)
4. [Backend Setup](#backend-setup)
5. [Database Setup](#database-setup)
6. [API Keys & Configuration](#api-keys--configuration)
7. [Running the App](#running-the-app)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Git**
- **Expo CLI:** `npm install -g expo-cli`

### Mobile Development
- **iOS:** macOS + Xcode (for iOS simulator)
- **Android:** Android Studio + Android SDK
- **Alternative:** Expo Go app on physical device

### Backend (Choose One)
- **Node.js:** 18+ (Express backend)
- **Python:** 3.10+ (FastAPI backend)

### Optional Tools
- **VS Code** (recommended editor)
- **Postman** (API testing)
- **MongoDB Compass** or **pgAdmin** (database GUI)

---

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd scripture-memory
```

### 2. Install Global Tools
```bash
# Expo CLI
npm install -g expo-cli

# EAS CLI (for builds)
npm install -g eas-cli
```

---

## Mobile App Setup

### 1. Navigate to Mobile Directory
```bash
cd mobile
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Create Environment Config
Create `.env` file in `mobile/` directory:
```bash
API_URL=http://localhost:3000
BIBLE_API_KEY=your_bible_api_key_here
```

### 4. Start Development Server
```bash
npx expo start
```

### 5. Run on Device/Simulator
- **iOS Simulator:** Press `i` in terminal
- **Android Emulator:** Press `a` in terminal
- **Physical Device:** Scan QR code with Expo Go app

---

## Backend Setup

### Option A: Node.js Backend

#### 1. Navigate to Backend
```bash
cd backend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Create Environment Config
Create `.env` file in `backend/` directory:
```bash
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/scripture_memory
JWT_SECRET=your_jwt_secret_here
BIBLE_API_KEY=your_bible_api_key_here
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=scripture-memory-songs
```

#### 4. Start Development Server
```bash
npm run dev
```

---

### Option B: Python Backend

#### 1. Navigate to Backend
```bash
cd backend
```

#### 2. Create Virtual Environment
```bash
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Create Environment Config
Create `.env` file in `backend/` directory:
```bash
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/scripture_memory
JWT_SECRET=your_jwt_secret_here
BIBLE_API_KEY=your_bible_api_key_here
```

#### 5. Start Development Server
```bash
python main.py
# or
uvicorn main:app --reload
```

---

## Database Setup

### Option A: PostgreSQL

#### 1. Install PostgreSQL
- **Windows:** [Download installer](https://www.postgresql.org/download/windows/)
- **Mac:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql`

#### 2. Create Database
```bash
psql -U postgres
CREATE DATABASE scripture_memory;
\q
```

#### 3. Run Migrations
```bash
cd backend
npm run migrate
# or: python migrate.py
```

---

### Option B: MongoDB

#### 1. Install MongoDB
- **Windows:** [Download installer](https://www.mongodb.com/try/download/community)
- **Mac:** `brew install mongodb-community`
- **Linux:** Follow [official guide](https://docs.mongodb.com/manual/installation/)

#### 2. Start MongoDB Service
```bash
# Mac/Linux
brew services start mongodb-community

# Windows
net start MongoDB
```

#### 3. Create Database
Database will be created automatically on first connection.

---

## API Keys & Configuration

### Bible API
1. Choose a Bible API:
   - [Bible API](https://bible-api.com/) (Free, KJV only)
   - [ESV API](https://api.esv.org/) (Free tier available)
   - [Scripture API](https://scripture.api.bible/) (Multiple translations)

2. Register and get API key
3. Add to `.env` files (both mobile and backend)

### AWS S3 (Audio Storage)
1. Create AWS account
2. Create S3 bucket: `scripture-memory-songs`
3. Create IAM user with S3 access
4. Add credentials to backend `.env`

### AI Music Generation (Future)
- Suno API
- MusicGen
- Custom solution (no API key needed)

---

## Running the App

### Full Development Environment

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev  # or: python main.py
```

**Terminal 2 — Mobile:**
```bash
cd mobile
npx expo start
```

**Terminal 3 — Database (if using local):**
```bash
# PostgreSQL
psql -U postgres

# MongoDB
mongosh
```

---

## Troubleshooting

### Common Issues

#### "Cannot connect to backend"
- Verify backend is running on correct port (3000)
- Check `API_URL` in mobile `.env` matches backend URL
- For physical devices: Use computer's local IP, not `localhost`

#### "Expo app won't start"
- Clear cache: `npx expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node -v` (must be 18+)

#### "Database connection failed"
- Verify database service is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `CREATE DATABASE scripture_memory;`

#### "Build failed on iOS"
- Open Xcode, clear derived data
- Run `npx expo prebuild --clean`
- Ensure Xcode version is up to date

#### "Build failed on Android"
- Open Android Studio, sync Gradle
- Ensure Android SDK is installed
- Check ANDROID_HOME environment variable

---

## Next Steps

After setup is complete:
1. Review [DEV_PLAN.md](../DEV_PLAN.md) for development roadmap
2. Check [API.md](./API.md) for API documentation
3. Begin Phase 1 tasks from development plan

---

## Additional Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Express Docs](https://expressjs.com/)

---

**Questions?** Open an issue or contact the project lead.
