# AI Study Buddy

AI Study Buddy is an AI-powered mobile learning platform designed to help students study more effectively. It combines personalized AI assistance with notes, flashcards, quizzes, and progress tracking in a single mobile application.

The application is built using **React Native (Expo)** for the frontend, **Node.js and Express.js** for the backend, **PostgreSQL** for data storage, and the **Google Gemini API** for AI-powered study assistance.

---

## 🚀 Features

### 🤖 AI Study Assistant

* Ask questions and get personalized explanations.
* Simplify complex concepts into easy-to-understand answers.
* Powered by the Google Gemini API.

### 🔐 Authentication

* User registration and login.
* JWT-based authentication.
* Password hashing using Bcrypt.
* Protected API routes for authenticated users.

### 📝 Notes Management

* Create personal study notes.
* Update existing notes.
* Delete notes.
* Organize and access notes through the mobile application.

### 🗂️ Flashcards

* Create flashcard decks.
* Add and manage flashcards.
* Review flashcards for effective revision and memorization.

### 🧠 Quizzes & Assessments

* Take topic-based quizzes.
* Submit quiz answers.
* Calculate and store quiz scores.
* Track learning performance.

### 📊 Activity & Progress Dashboard

* View study activity.
* Track recent study sessions.
* Monitor learning statistics and quiz performance.
* Visualize overall study progress.

---

## 🛠️ Tech Stack

### Frontend

* **React Native**
* **Expo**
* **JavaScript**
* **React**

### Backend

* **Node.js**
* **Express.js**
* **PostgreSQL**
* **REST API**
* **JWT**
* **Bcrypt**

### AI

* **Google Gemini API**
* **@google/generative-ai**

---

## 📁 Project Structure

```text
ai_study_buddy/
│
├── backend/
│   ├── database/
│   │   └── schema.sql
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── Database configuration
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── chatController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── flashcardController.js
│   │   │   ├── notesController.js
│   │   │   ├── quizController.js
│   │   │   └── userController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── flashcardRoutes.js
│   │   │   ├── notesRoutes.js
│   │   │   ├── quizRoutes.js
│   │   │   └── userRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── geminiService.js
│   │   │   └── activityService.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── assets/
│   ├── App.js
│   ├── app.json
│   └── package.json
│
└── README.md
```

> **Note:** The exact files and folders may vary depending on the current implementation of the project.

---

# ⚙️ Setup Instructions

## Prerequisites

Before running the project, make sure you have the following installed:

* **Node.js v18 or higher**
* **PostgreSQL**
* **Expo Go** on your mobile device, or an Android/iOS emulator
* **Google Gemini API Key**

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ai_study_buddy
```

Replace `<your-repository-url>` with the URL of your GitHub repository.

---

# 🔧 Backend Setup

## 2. Navigate to the Backend

```bash
cd backend
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

You can use `.env.example` as a template.

Example:

```env
PORT=5000

DATABASE_URL=postgres://username:password@localhost:5432/ai_study_buddy

JWT_SECRET=your_jwt_secret_key

GEMINI_API_KEY=your_gemini_api_key
```

### Environment Variables

| Variable         | Description                           |
| ---------------- | ------------------------------------- |
| `PORT`           | Port used by the Express backend      |
| `DATABASE_URL`   | PostgreSQL database connection string |
| `JWT_SECRET`     | Secret key used to sign JWT tokens    |
| `GEMINI_API_KEY` | Google Gemini API key                 |

> **Important:** Never commit your `.env` file or API keys to GitHub.

---

## 5. Create the PostgreSQL Database

Create a PostgreSQL database named:

```text
ai_study_buddy
```

Then initialize the database schema:

```bash
psql -U your_postgres_user -d ai_study_buddy -f database/schema.sql
```

Replace `your_postgres_user` with your PostgreSQL username.

If you are using PostgreSQL locally, make sure the PostgreSQL service is running before starting the backend.

---

## 6. Start the Backend

Run:

```bash
npm run dev
```

The backend should start on:

```text
http://localhost:5000
```

---

# 📱 Frontend Setup

## 7. Open a New Terminal

From the project root:

```bash
cd frontend
```

## 8. Install Dependencies

```bash
npm install
```

## 9. Start Expo

```bash
npx expo start
```

Expo will display a QR code and development options in the terminal.

You can:

* Scan the QR code using **Expo Go** on your phone.
* Press `a` to open the Android emulator.
* Press `i` to open the iOS simulator (macOS required).

---

# 🔌 API Routes

The backend provides the following REST API endpoints:

| Route                | Method   | Description                         |
| -------------------- | -------- | ----------------------------------- |
| `/api/auth/register` | `POST`   | Register a new user                 |
| `/api/auth/login`    | `POST`   | Login and receive a JWT             |
| `/api/chat`          | `POST`   | Send questions to the AI assistant  |
| `/api/notes`         | `GET`    | Retrieve user notes                 |
| `/api/notes`         | `POST`   | Create a new note                   |
| `/api/notes`         | `DELETE` | Delete a note                       |
| `/api/flashcard`     | `GET`    | Retrieve flashcard decks            |
| `/api/flashcard`     | `POST`   | Create/manage flashcard decks       |
| `/api/flashcard`     | `DELETE` | Delete a flashcard deck             |
| `/api/quiz`          | `GET`    | Retrieve available quizzes          |
| `/api/quiz`          | `POST`   | Submit quiz responses/scores        |
| `/api/dashboard`     | `GET`    | Retrieve user activity and progress |
| `/api/user`          | `GET`    | Retrieve user account information   |
| `/api/user`          | `PUT`    | Update user account information     |

> Some endpoints require a valid JWT token in the `Authorization` header.

---

# 🔑 Authentication

AI Study Buddy uses **JWT-based authentication**.

After a successful login, the server returns an authentication token.

Protected requests should include the token using:

```http
Authorization: Bearer <your_jwt_token>
```

---

# 🤖 Gemini AI Integration

The AI Study Assistant uses the Google Gemini API to generate study-related responses.

The Gemini API key is configured through the backend environment variables:

```env
GEMINI_API_KEY=your_gemini_api_key
```

The API key should remain on the backend and should **not** be exposed in the React Native frontend.

---

# 🗄️ Database

AI Study Buddy uses **PostgreSQL** as its relational database.

The database schema is located at:

```text
backend/database/schema.sql
```

The schema contains the tables required for features such as:

* User accounts
* Notes
* Flashcards
* Quizzes
* Quiz results
* Study activity
* Progress tracking

---

# 🧪 Development

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a separate terminal:

```bash
cd frontend
npx expo start
```

Both services should be running while developing and testing the application.

---

# 🔒 Security Notes

For security reasons:

* Do not commit `.env` files.
* Do not expose your Gemini API key in the frontend.
* Use a strong `JWT_SECRET`.
* Do not share API keys publicly.
* Add `.env` to `.gitignore`.

Example:

```gitignore
node_modules/
.env
.expo/
dist/
```

---

# 🐛 Troubleshooting

### Backend does not start

Make sure:

1. PostgreSQL is running.
2. Your `.env` file exists inside `backend/`.
3. The database name and credentials are correct.
4. All backend dependencies are installed.

Try:

```bash
cd backend
npm install
npm run dev
```

### Frontend cannot connect to the backend

When running the app on a physical phone, `localhost` refers to the **phone itself**, not your computer.

Use your computer's local network IP address for the backend URL when required.

For example:

```text
http://192.168.x.x:5000
```

Make sure your phone and computer are connected to the same Wi-Fi network.

---

# 📌 Future Improvements

Potential improvements for future versions include:

* Spaced-repetition scheduling for flashcards
* More advanced AI study plans
* Personalized learning recommendations
* Push notifications and study reminders
* Offline study support
* More detailed analytics
* Dark mode
* Gamification and achievement badges

---

# 👨‍💻 Project

**AI Study Buddy** is designed to provide students with an integrated platform for AI-assisted learning, revision, assessment, and progress tracking.
