# Task Management System (MVP Features)

## Tech Stack & Reasoning

### Backend
| Technology | Reason |
|---|---|
| **Node.js + Express** | Lightweight, fast to set up, and well-suited for building REST APIs with minimal boilerplate. Ideal for a time-constrained MVP. |
| **PostgreSQL** | Robust, open-source relational database with strong support for complex queries. Chosen for its reliability and compatibility with production environments. |
| **node-postgres (pg)** | The standard PostgreSQL client for Node.js. Simple, well-documented, and widely used in production. |

### Frontend
| Technology | Reason |
|---|---|
| **Vanilla HTML/CSS/JavaScript** | No build step, no framework overhead, immediately runnable in any browser. Appropriate for a focused MVP where simplicity and speed of delivery matter more than scalability of the view layer. |
| **Static files via Express** | Frontend is served directly from the same Express server using `express.static`, avoiding CORS issues and keeping the project as a single runnable unit. |

> For a production system, the frontend would be migrated to a framework (e.g. React) and served independently, with the API behind a proper reverse proxy.

---

## Project Structure

```
taskmanagement-system/
├── public/                 # Frontend static files
│   ├── index.html          # Task list page
│   ├── form.html           # Create / Edit task page
│   ├── style.css           # Shared styles
│   ├── api.js              # Centralised API fetch layer
│   ├── app.js              # List page logic
│   └── form.js             # Form page logic
├── src/
│   ├── config/             # App configuration
│   │   ├── env.js          # Config environment variables
│   ├── controllers/        # Route handler functions
│   ├── database/
│   │   ├── db.js           # Database connection
│   │   └── schema.sql      # Table definitions
│   ├── middleware/         # Express middleware
│   ├── repository/         # Database query layer
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic layer
│   └── utility/            # Helper functions
├── .env
├── .gitignore
├── index.js                # Entry point
├── package.json
└── README.md
```

---

## Installation & Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/hanminthawhmt/taskmanagement-system.git
cd taskmanagement-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL="postgresql://your_username@localhost:5432/db_task_management"
```

### 4. Set up the database

Make sure PostgreSQL is running on your machine, then create the database and run the schema:

```bash
# Create the database
createdb db_task_management

# Run the schema
psql -d db_task_management -f src/database/schema.sql
```

### 5. Start the server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

### 6. Open the app

Visit **http://localhost:3000** in your browser.
| Page | URL |
|---|---|
| Task List | http://localhost:3000/index.html |
| Create Task | http://localhost:3000/form.html |
| Edit Task | http://localhost:3000/form.html?id=:id |
---

## API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | List all tasks (supports filter, search, pagination) |
| `GET` | `/tasks/:id` | Get a single task by ID |
| `POST` | `/tasks` | Create a new task |
| `PUT` | `/tasks/:id` | Update an existing task |
| `DELETE` | `/tasks/:id` | Delete a task |

### Query Parameters for `GET /tasks`

| Parameter | Type | Example |
|---|---|---|
| `search` | string | `?search=database migration` |
| `status` | string | `?status=todo,in_progress` |
| `priority` | string | `?priority=high,medium` |
| `tags` | string | `?tags=backend,urgent` |
| `page` | number | `?page=2` |
| `limit` | number | `?limit=10` |

### Task Object

```json
{
  "title": "Fix login bug",
  "description": "Users cannot log in with Google OAuth.",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-06-01T23:59:59Z",
  "tags": ["backend", "auth"]
}
```

**Field rules:**
- `title` — required
- `status` — one of: `todo`, `in_progress`, `done`
- `priority` — one of: `low`, `medium`, `high`
- `tags` — array, maximum 5 items

---

## Completed Features

- [x] CRUD API for tasks (Create, Read, Update, Delete)
- [x] Filter by status, priority, and tags (multiple values supported)
- [x] Full-text search across title and description
- [x] Pagination with total count
- [x] Frontend task list with filter toolbar and search
- [x] Create and Edit task form with validation
- [x] Delete confirmation modal
- [x] Loading state and error state on all pages
- [x] Tag input with max 5 enforcement (frontend + backend)
- [x] Correct HTTP status codes (400, 404, 500)
- [x] Overdue due date highlighting

## Incomplete / Future Improvements

- [ ] User authentication and per-user task ownership
- [ ] File attachments per task
- [ ] Real-time updates (WebSockets)
- [ ] Separate frontend deployment (React + Vite)
- [ ] Docker setup for easier deployment
