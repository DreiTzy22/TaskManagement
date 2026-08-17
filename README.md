# Task Management Application

A fullstack Task Management Application built with **React + Vite** (frontend), **Node.js + Express** (backend), and **PostgreSQL** (database).

This project implements the required core features: Create, Read, Update, Delete tasks, plus Search, and Filter functionality.

---

## Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Add a task** | Create tasks with a required title and optional description |
| 2 | **Mark complete / incomplete** | Toggle a task's completion status |
| 3 | **Edit task details** | Modify a task's title and description (existing data is pre-loaded into the edit form) |
| 4 | **Delete task** | Remove a task with a two-step confirmation to prevent accidents |
| 5 | **Search tasks** | Search by task title or description (debounced, case-insensitive partial match) |
| 6 | **Filter tasks** | Filter by **All Tasks**, **Incomplete**, or **Completed** |
| 6b | **Search + Filter combined** | Search and filter work together seamlessly (e.g., search for "report" + filter "Completed" returns only completed tasks matching "report") |

> No authentication, no due dates, no categories — only the core features listed above.

---

## Tech Stack

### Frontend
- **React 18** — Hooks (useState, useEffect, useMemo)**
- **Vite 5** — Build tool & dev server with `/api` proxy to backend
- **Vanilla CSS** — Responsive, two-column side-by-side layout with sticky form

### Backend
- **Node.js** — Runtime
- **Express 4** — RESTful API with clean separation (routes → controllers → DB)
- **pg (node-postgres)** — Parameterized queries (SQL-safe)
- **express-async-handler** — Async/await route error handling
- **cors** — Cross-Origin Resource Sharing
- **dotenv** — Environment variable management
- **Custom request logger** — Colorful Laravel-style terminal logging of every API request

### Database
- **PostgreSQL** — Auto-creates the `tasks` table on first startup

---

## Project Structure

```
TaskManagement/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL Pool + automatic table creation
│   ├── controllers/
│   │   └── taskController.js     # Business logic + input validation
│   ├── middleware/
│   │   ├── errorMiddleware.js    # 404 handler + centralized JSON error response
│   │   └── requestLogger.js     # Colorful request / response terminal logger
│   ├── routes/
│   │   └── taskRoutes.js        # RESTful route definitions
│   ├── .env                     # Database credentials (create from .env.example)
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskForm.jsx         # Add / Edit task form (edit pre-populated on edit
│   │   │   ├── TaskItem.jsx        # Single task with checkbox + edit/delete actions
│   │   │   ├── TaskList.jsx         # List with loading / empty / error states
│   │   │   └── SearchFilterBar.jsx # Search input + All/Incomplete/Completed tabs with counts
│   │   ├── services/
│   │   │   └── taskApi.js         # Centralized fetch-based API client with error handling
│   │   ├── App.jsx                # Root component — state, event handlers, notifications
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js           # Vite + /api proxy to localhost:5000
│   └── package.json
├── .gitignore
└── README.md
```

---

## Prerequisites

Before running the application make sure you have installed:

1. **Node.js** ≥ 16** — https://nodejs.org/
2. **PostgreSQL** ≥ 12** — https://www.postgresql.org/download/
3. **npm** (bundled with Node.js)

---

## Setup Instructions

### 1. Create the PostgreSQL Database

Using `psql`, `pgAdmin`, or your preferred PostgreSQL client:

```sql
CREATE DATABASE task_manager;
```

> **Note:** You can use a different database name; just match it in the `.env` file's `PG_DATABASE` value below.

---

### 2. Configure and Run the Backend

```bash
# 1. Go into backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Copy the env template and edit it with your real Postgres credentials
copy .env.example .env          # Windows (PowerShell: Copy-Item .env.example .env
#       — or —
cp .env.example .env          # macOS/Linux
```

Edit `backend/.env`** (edit values to match your PostgreSQL installation:

```
PORT=5000
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres            # your PostgreSQL username
PG_PASSWORD=your_password   # your PostgreSQL password
PG_DATABASE=task_manager      # the database you created in step 1
```

Start the backend:

```bash
# Development mode (auto-reloads on code changes using nodemon):
npm run dev

# — or production mode:
npm start
```

The backend API runs on **http://localhost:5000** and every request is logged to the terminal in a colorful Laravel-style format.

**Verify it's running by opening in your browser or Postman:

```
GET http://localhost:5000/api/health
```

→ returns: `{ "status": "ok", "message": "Task Manager API is running" }`

---

### 3. Set Up and Run the Frontend

In a **second** terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on **http://localhost:5173** — open this URL in your browser to use the application.

Vite automatically proxies all `/api/*` requests to `http://localhost:5000` (configured in `vite.config.js`) so no CORS setup is needed for local development.

---

## RESTful API Endpoints

All endpoints are prefixed with `/api/tasks`.

| Method | Endpoint                 | Description                                  | Request Body / Query Params |
| :----- | :--------------------- | :--------------------------------------- | :----------------------- |
| GET    | `/api/tasks`          | List tasks (with optional search + filter)  | Query: `search`, `filter`  |
| POST   | `/api/tasks`          | Create a new task                        | Body: `{ title, description }` |
| GET    | `/api/tasks/:id`      | Get a single task by ID                   | —                        |
| PUT    | `/api/tasks/:id`      | Update a task (partial updates supported)      | Body: `{ title?, description?, completed? }` |
| DELETE | `/api/tasks/:id`      | Delete a task                            | —                        |
| PATCH  | `/api/tasks/:id/toggle` | Toggle a task's `completed` boolean    | —                        |

### GET `/api/tasks` Query Parameters

- **`search`** (optional) — Free-text search against `title` or `description` (case-insensitive, `ILIKE %value%`)
- **`filter`** (optional):
  - `all`** (default) — returns every task
  - `incomplete` — only `completed = false`
  - `completed` — only `completed = true`

**Example combined request:**

```
GET /api/tasks?search=report&filter=completed
```

→ Returns only completed tasks whose title or description contains "report".

### Task Data Model

```json
{
  "id": 1,
  "title": "Finish project report",
  "description": "Complete the Q3 report with metrics section.",
  "completed": false,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Database Schema (auto-created)

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  completed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Frontend Highlights

| Area | Implementation notes |
| :--- | :----------- |
| **Component structure** | 4 single-purpose components: `TaskForm`, `TaskItem`, `TaskList`, `SearchFilterBar` |
| **State management** | Lifted to `App.jsx` using `useState`, derived data with `useMemo` for filter counts |
| **Edit form** | On clicking "Edit", `editingTask` is set and a `useEffect` in `TaskForm` pre-populates title and description into the form fields |
| **Search debouncing** | 250 ms debounce to avoid spamming the API on every keystroke |
| **Notifications** | Success/error toast notifications (auto-dismiss 3 s) |
| **List rendering** | `TaskList` maps tasks to `TaskItem`s. Has proper **Loading, Error, and Empty** states |
| **Search + filter** | Work together — both query params are sent together; backend combines them in SQL |
| **Delete UX** | Two-step confirm/cancel to prevent accidental deletion |
| **Layout** | Two-column CSS grid: form (sticky left, fixed width 380 px), tasks list (1fr right); collapses to 1 column below 900 px |
| **API client** | `services/taskApi.js` Centralized `taskApi.js` wraps `fetch` with consistent error throwing across all 6 endpoints |

---

## Backend Highlights

| Area | Implementation notes |
| :--- | :----------- |
| **Separation of concerns** | `routes → controllers → db config, each in dedicated folders |
| **Parameterized queries** | Every SQL query uses `$1, $2, pg` parameter binding — safe against SQL injection |
| **Input validation** | Title required, max 255 chars; `completed` must be boolean; 404 for missing task; partial PUT supported; bodies trimmed of whitespace |
| **Error handling** | `express-async-handler` + `errorMiddleware` centralize errors to consistent JSON format. In dev, stacktrace included |
| **Request logging** | Custom `requestLogger.js` middleware logs every request with colorized method / status / duration / size / URL / IP + body preview |
| **Auto DB init** | `initDB` in `config/db.js` auto-creates `tasks` table if it doesn't exist on server start — no migrations to run manually |

---

## Build for Production

### Frontend

```bash
cd frontend
npm run build
```

Output goes to `frontend/dist/` — optimized, minified, hashed assets.

Preview the build locally with:

```bash
npm run preview
```

---

## Troubleshooting

**"Database initialization failed: ..."**
- Ensure PostgreSQL service is running
- Check `.env` credentials (host, port, user, password, database name all correct
- Make sure the database `task_manager` actually exists
- In PowerShell terminal and you can connect with the user `postgres` to that DB with that password

**"relation tasks does not exist"**
- Restart the backend. On startup, `initDB()` runs `CREATE TABLE IF NOT EXISTS` — it will create the table automatically. If not, run the SQL above manually with psql/pgAdmin

**CORS / Network errors in browser**
- Backend already `cors()` is applied globally. Dev server proxies `/api` → backend. For production deploy, serve frontend from same origin or set explicit origin in `server.js` cors options.

**Port 5000 or 5173 already in use**
- Windows (PowerShell): `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
- Or change backend `PORT` in the backend `.env` and update the `target` in `frontend/vite.config.js` server.proxy./api accordingly

---

## Running Both Services Summary (Quick Start)

Terminal 1 — Backend:

```bash
cd backend
npm install
# create .env from .env.example
npm run dev
```

Terminal 2 — Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

For assessment / demonstration purposes.
