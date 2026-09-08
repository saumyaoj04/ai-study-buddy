# AI Study Buddy

An AI-powered mobile learning platform built with React Native (Expo), Node.js, Express, and PostgreSQL. AI Study Buddy helps students optimize their study habits with personalized AI assistance, note management, flashcard decks, quiz assessments, and progress tracking.

---

## 🚀 Features

* **AI Assistant Integration:** Powered by Google Gemini API (`geminiService.js`) to provide interactive study explanations and concept answers.
* **Authentication System:** Secure registration and login using JWT authentication and Bcrypt password hashing.
* **Notes Management:** Create, update, store, and organize personal study notes.
* **Flashcards System:** Build and review flashcard decks for spaced repetition learning.
* **Quizzes & Assessments:** Take topic-based quizzes to evaluate subject knowledge and track scores.
* **Activity & Progress Dashboard:** Visual summaries tracking user study consistency, recent sessions, and learning stats.

---

## 🛠️ Tech Stack

**Frontend:**
* **Framework:** React Native (Expo)
* **Language:** JavaScript / React

**Backend:**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL (raw SQL schema setup)
* **AI Integration:** `@google/generative-ai` (Gemini API)
* **Authentication:** JSON Web Tokens (JWT) & Bcrypt

---

## 📁 Project Structure

```text
ai_study_buddy/
├── backend/
│   ├── database/
│   │   └── schema.sql        # PostgreSQL database schema
│   ├── src/
│   │   ├── config/           # Database setup and connections
│   │   ├── controllers/      # Auth, Chat, Dashboard, Flashcard, Notes, Quiz, User controllers
│   │   ├── middleware/       # JWT auth & error handling middlewares
│   │   ├── routes/           # REST API route handlers
│   │   ├── services/         # Gemini AI & activity tracking services
│   │   └── server.js         # Entry point for backend Express app
│   ├── .env.example
│   └── package.json
└── frontend/                 # React Native / Expo codebase
    ├── assets/               # App icons, splash screens, and images
    ├── App.js                # React Native main application component
    ├── app.json              # Expo setup configuration
    └── package.json

⚙️ Setup InstructionsPrerequisitesNode.js: v18.x or higherPostgreSQL: Installed and running locally or hosted remotelyExpo Go App: Installed on your mobile device (or an Android/iOS emulator)Gemini API Key: Obtained from Google AI Studio1. Backend ConfigurationNavigate to the backend folder:Bashcd backend
Install dependencies:Bashnpm install
Setup environment variables:Create a .env file in the backend directory based on .env.example:Code snippetPORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/ai_study_buddy
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
Initialize PostgreSQL database schema:Bashpsql -U your_postgres_user -d ai_study_buddy -f database/schema.sql
Run the development backend server:Bashnpm run dev
2. Frontend ConfigurationNavigate to the frontend folder:Bashcd frontend
Install dependencies:Bashnpm install
Start the Expo server:Bashnpx expo start
Scan the generated QR code using the Expo Go app on your phone, or press a for Android Emulator / i for iOS Simulator.🔌 API Routes OverviewRoute PathMethodDescription/api/auth/registerPOSTRegister a new user/api/auth/loginPOSTUser login and JWT token generation/api/chatPOSTAI assistant queries handled via Gemini/api/notesGET / POST / DELETECRUD endpoints for student study notes/api/flashcardGET / POST / DELETEManage flashcard decks/api/quizGET / POSTRetrieve quizzes and submit test scores/api/dashboardGETFetch overall user activity and study stats/api/userGET / PUTFetch and update user account settings
