# TaskManagement
Practical Exam system
# Task Management Application

A fullstack Task Management Application built with **React + Vite** (frontend), **Node.js + Express** (backend), and **PostgreSQL** (database).

---

## Features

- **Add a task** - Create tasks with title and optional description
- **Mark as complete / incomplete** - Toggle task completion status
- **Edit task details** - Update task title and description
- **Delete task** - Remove tasks with confirmation
- **Search tasks** - Search by task name or description (case-insensitive)
- **Filter tasks** - Filter by All Tasks, Incomplete, or Completed
- **Search + Filter combined** - Search and filter work together seamlessly

---

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite 5** - Build tool & dev server
- **Vanilla CSS** - Clean, responsive styling

### Backend
- **Node.js** - Runtime
- **Express 4** - Web framework
- **pg (node-postgres)** - PostgreSQL client
- **express-async-handler** - Async error handling
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

### Database
- **PostgreSQL** - Relational database

---

## Project Structure

```
Practical Exam/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection & table init
│   ├── controllers/
│   │   └── taskController.js     # Request handlers / business logic
│   ├── middleware/
│   │   └── errorMiddleware.js    # 404 & error handling
│   ├── routes/
│   │   └── taskRoutes.js        # API route definitions
│   ├── .env.example             # Environment variables template
│   ├── package.json
│   └── server.js                # Express app entry point
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── TaskForm.jsx         # Add/Edit task form
    │   │   ├── TaskItem.jsx        # Single task display + actions
    │   │   ├── TaskList.jsx         # Task list container
    │   │   └── SearchFilterBar.jsx # Search input + filter tabs
    │   ├── services/
    │   │   └── taskApi.js         # API client (fetch wrappers)
    │   ├── App.jsx                # Root component (state & logic)
    │   ├── App.css                # App styles
    │   ├── index.css              # Global styles & CSS variables
    │   └── main.jsx             # React entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Prerequisites

Before running the application, make sure you have the following installed:

1. **Node.js** (v16 or higher) - [download](https://nodejs.org/))
2. **PostgreSQL** (v12 or higher) - [download](https://www.postgresql.org/download/)
3. **npm** (comes with Node.js)

---

## Setup Instructions

### 1. Clone / Prepare the Database

First, create the PostgreSQL database:

```sql
-- Using psql or pgAdmin:
CREATE DATABASE task_manager;
```

You can also use an existing database; just make sure to update the `PG_DATABASE` value accordingly.

---

### 2. Set Up the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create the .env file from the template
# (copy or rename .env.example to .env)
# then edit the values to match your PostgreSQL credentials
```

**Backend `.env` file configuration:**

```
PORT=5000
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres           # your PostgreSQL username
PG_PASSWORD=your_password  # your PostgreSQL password
PG_DATABASE=task_manager  # the database you created
```

> **Note:** The `tasks` table is automatically created the first time the backend starts (no manual migrations needed).

---

### 3. Set Up the Frontend

```bash
# In a NEW terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

The frontend uses Vite's built-in proxy (`/api` → `http://localhost:5000`) so no extra config is required for local development.

---

## Running the Application

You will need **two terminal windows** — one for the backend and one for the frontend.

### Terminal 1 — Start the Backend

```bash
cd backend

# Development mode (auto-reloads with nodemon):
npm run dev  
# OR production mode:
npm start
```

The backend API will run on **http://localhost:5000**

You can verify it's running by visiting:
- `GET http://localhost:5000/api/health` → should return `{ status: "ok" }`

---

### Terminal 2 — Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will run on **http://localhost:5173**

Open this URL in your browser to use the application.

---

## API Endpoints

All endpoints are prefixed with `/api/tasks`.

| Method | Endpoint            | Description                                  | Query Params               |
|--------|---------------------|----------------------------------------------|----------------------------|
| GET    | `/api/tasks`       | List tasks (with optional search & filtering)   | `search`, `filter`         |
| POST   | `/api/tasks`       | Create a new task                          | Body: `{ title, description }` |
| GET    | `/api/tasks/:id`   | Get a single task by ID                     | —                          |
| PUT    | `/api/tasks/:id`   | Update task (title, description, completed) | Body: partial task data      |
| DELETE | `/api/tasks/:id`   | Delete a task                                | —                          |
| PATCH  | `/api/tasks/:id/toggle` | Toggle task completion status        | —                          |

### Query Params for GET /api/tasks

- **`search`** (optional): text to search in title or description (case-insensitive, partial match)
- **`filter`** (optional):
  - `all` (default) — show all tasks
  - `incomplete` — only incomplete tasks
  - `completed` — only completed tasks

Example combined request:

```
GET /api/tasks?search=report&filter=completed
```

Returns completed tasks where title or description contains "report".

### Data Model — Task

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

---

## Key Directories & Files of Note

- **[server.js** — Express app initialization, global middleware, error handlers
- **db.js** — PostgreSQL Pool setup & automatic table creation
- **taskController.js** — All request handlers with input validation
- **taskRoutes.js** — RESTful route definitions
- **App.jsx** — Root component managing task state, API calls, search/filter debouncing (250ms), notifications, edit mode
- **taskApi.js** — Centralized API client wrapping fetch with consistent error handling

---

## Validation & Error Handling

### Backend
- Task **title is required** and must be ≤ 255 characters
- Description is optional; empty strings are stored as `''`
- `completed` must be a boolean when provided
- 404 returned for non-existent task IDs
- 400 with descriptive message for invalid input
- Centralized error middleware returns JSON with `message` (and `stack` in non-production)

### Frontend
- Form-level validation before submission
- Error displays inline in the task form
- Loading, empty-state, and error states for the task list
- Delete requires a two-step Confirm/Cancel to prevent accidental deletion
- Notifications appear after successful operations (auto-dismiss after 3s)

---

## Build for Production

### Frontend Build

```bash
cd frontend
npm run build
```

This generates an optimized production build in `frontend/dist/`.
Preview it with:

```bash
npm run preview
```

---

## Troubleshooting

**"Database connection failed**
- Verify PostgreSQL is running
- Double-check `.env` values (host, port, user, password, database)
- Ensure the `task_manager` database exists

**"relation "tasks" does not exist"**
- The backend creates the table automatically on first run. If you see this, restart the backend; it will create the table. If the error persists, manually run the SQL from `config/db.js` manually in your database.

**CORS errors**
- The backend enables CORS for all origins by default. For production, restrict origins in `server.js`.

**Port 5000 or 5173 is in use**
- Change the `PORT` in the backend `.env` (and update the Vite proxy in `frontend/vite.config.js`)
- Or use `lsof -i :5000` / `netstat -ano | findstr :5000` to find and kill the process.

---

## License

For assessment / demonstration purposes.
