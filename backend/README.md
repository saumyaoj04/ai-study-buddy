# AI Study Buddy Backend

Express and PostgreSQL backend for the AI Study Buddy mobile app. It implements the project flows in the specification: authentication, notes, flashcards, AI generation, quizzes, quiz progress, chat, streaks, achievements, and dashboard data.

## Setup

1. Copy `.env.example` to `.env` and replace its placeholder values. Never commit `.env`.
2. Create a PostgreSQL database named `ai_study_buddy` (or use the name in `DB_NAME`).
3. Run the schema from this folder:

   ```powershell
   psql -U postgres -d ai_study_buddy -f database/schema.sql
   ```

4. Install dependencies and start the API:

   ```powershell
   npm install
   npm run dev
   ```

The health check is at `GET /health`. The server defaults to port 5000.

## AI setup

The chat, quiz-generation, and flashcard-generation endpoints use the Gemini REST API. Add `GEMINI_API_KEY` to `.env`; `GEMINI_MODEL` defaults to `gemini-3.7-flash`. Without a key, all non-AI features work and AI endpoints return a clear `503` response.

## Authentication

Register with `POST /api/auth/register`:

```json
{ "fullName": "Student Name", "email": "student@example.com", "password": "at-least-8-characters" }
```

Login with `POST /api/auth/login`. Send its token on every protected endpoint:

```
Authorization: Bearer <token>
```

## API routes

| Area | Routes |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile` |
| User | `GET /api/user/profile` |
| Notes | `POST/GET /api/notes`, `PUT/DELETE /api/notes/:id` |
| Flashcards | `POST/GET /api/flashcards`, `POST /api/flashcards/generate`, `PUT/DELETE /api/flashcards/:id` |
| Quizzes | `POST/GET /api/quizzes`, `POST /api/quizzes/generate`, `GET /api/quizzes/:id`, `POST /api/quizzes/:id/attempts` |
| AI chat | `POST /api/chat`, `GET /api/chat/history` |
| Dashboard | `GET /api/dashboard` |

Manual quiz creation accepts `{ title, subject, noteId?, questions }`, where each question has `question`, `options` (at least two strings), and `answerIndex`. `GET /api/quizzes/:id` deliberately excludes correct answers. Submit selected indexes with `{ "answers": [0, 3, 1], "studyMinutes": 20 }`.

## Project layout

```
src/
  config/       PostgreSQL pool
  controllers/  HTTP request handlers
  middleware/   JWT and error middleware
  routes/       API endpoints
  services/     Gemini, streak, progress, achievement logic
database/
  schema.sql    Reproducible PostgreSQL schema and safe upgrades
```
