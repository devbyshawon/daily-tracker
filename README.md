# Daily Tracker — Buffer-Enforced Daily Productivity Tracker

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat&logo=render&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=flat&logo=github&logoColor=white)

**Live Demo:** [https://devbyshawon.github.io/daily-tracker](https://devbyshawon.github.io/daily-tracker)  
**Repository:** [https://github.com/devbyshawon/daily-tracker](https://github.com/devbyshawon/daily-tracker)

> ⚠️ The backend is hosted on Render's free tier. The first request after a period of inactivity may take 20–30 seconds due to a cold start. Subsequent requests will be fast.

---

## Screenshots

> ![Task Board](./screenshots/dashboard.png)
> ![Buffer Blocked State](./screenshots/buffer-banner.png)
> ![Live Timer](./screenshots/timer.png)
> ![New Task Modal](./screenshots/new-task-modal.png)
> ![Edit Task Modal](./screenshots/edit-task-modal.png)

---

## About The Project

Daily Tracker is a full-stack personal productivity tool built with the MERN stack to manage a fixed daily schedule across four competing priorities — **Thesis**, **Job Search**, **Freelancing** and **Skill Development**. Unlike a standard to-do list, it enforces real accountability through a **buffer system**: any task not completed on its scheduled day is automatically locked into a "buffer" state the following day and no new tasks can be created anywhere in the app until every buffered task is resolved.

Each task supports a live, resumable countdown timer that persists across page refreshes, plays a chime and fires a native browser/OS notification when the target duration is reached. Tasks can carry a resource link, a comment and are editable after creation — with the scheduled date deliberately locked to preserve the integrity of the buffer logic.

The backend follows strict **MVC architecture** (Model / Controller / Routes cleanly separated) as the reusable template for all future full-stack projects and the frontend UI system (modals, layout, card patterns) is shared with the author's other MERN projects for visual and structural consistency across a portfolio.

---

## Features

- **Four-field task board** — Thesis, Job Search, Freelancing, Skill Development - each tracked independently with a completion counter
- **Buffer enforcement** — a task missed on its scheduled day is auto-swept into a locked `buffer` state; new task creation is blocked (`409`) until it's resolved and the buffered task itself cannot be edited or deleted (`403`) — only moved back to today
- **Live, resumable timer** — counts up per task, banks elapsed time across pause/resume and page refreshes, plays a chime and fires a native notification when the target duration is reached
- **Task editing** — title, description, resource link, time and target duration are editable after creation; scheduled date is intentionally locked
- **Resource links** — attach a reference URL to any task, opens in a new tab
- **Per-task comments** — free-text notes saved on blur
- **Role-consistent UI patterns** — Modal, DashboardLayout and card components follow the same structure used across the author's other projects
- **Loading and error states** — every API call has a loading indicator and a scoped, visible error message

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Axios, Lucide React |
| Styling | Tailwind CSS 4 |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose ODM |
| Architecture | MVC (Model – Controller – Routes) |
| Frontend Deployment | GitHub Pages |
| Backend Deployment | Render |
| Database Hosting | MongoDB Atlas |

---

## Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                │
│  Pages: Dashboard                                       │
│  Components: TaskCard (timer + comment + resource link),│
│              shared/Modal, shared/DashboardLayout       │
│  HTTP: Axios instance (services/api.js)                 │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS REST API
┌──────────────────────────▼──────────────────────────────┐
│                 SERVER (Node.js + Express, MVC)         │
│  Routes: /api/tasks                                     │
│  Controller: taskController                             │
│    — buffer sweep on every read                         │
│    — create blocked while buffer is non-empty           │
│    — edit/delete blocked on buffered tasks              │
└──────────────────────────┬──────────────────────────────┘
                           │ Mongoose ODM
┌──────────────────────────▼──────────────────────────────┐
│                  DATABASE (MongoDB Atlas)               │
│  Collection: tasks                                      │
│  Status states: pending → done                          │
│                 pending → buffer → pending (resolved)   │
└─────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A MongoDB Atlas account (free tier)

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/devbyshawon/daily-tracker
cd daily-tracker
```

> Note: unlike some of the author's other projects that use separate frontend/backend repos, Daily Tracker is a single repository with `backend/` and `frontend/` folders.

**2. Set up the backend:**
```bash
cd backend
npm install
```

Create a `.env` file in the root of `backend`:
```
MONGO_URI=your_mongodb_atlas_connection_string
CLIENT_URL=http://localhost:5173
PORT=6001
```

Start the backend server:
```bash
npm run dev
```
The backend runs on `http://localhost:6001`

**3. Set up the frontend:**
```bash
cd ../frontend
npm install
```

Create a `.env` file in the root of `frontend`:
```
VITE_API_URL=http://localhost:6001/api
```

Start the frontend:
```bash
npm run dev
```
The frontend runs on `http://localhost:5173`

---

## Environment Variables

**Backend** (`backend/.env`):

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/tracker` |
| `CLIENT_URL` | Frontend origin, used for CORS | `http://localhost:5173` |
| `PORT` | Port the server listens on | `6001` |

**Frontend** (`frontend/.env`):

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for API requests | `http://localhost:6001/api` |

> Never commit your `.env` files to GitHub. Both are already covered by `.gitignore`.

---

## API Overview

| Method | Endpoint | Description | Notes |
|--------|----------|-------------|-------|
| GET | `/api/tasks` | Get all tasks | Sweeps overdue `pending` tasks into `buffer` first |
| POST | `/api/tasks` | Create a new task | Returns `409` if any task is currently in `buffer` |
| PATCH | `/api/tasks/:id/done` | Mark a task complete | |
| PATCH | `/api/tasks/:id/clear-buffer` | Resolve a buffered task | Sets status to `pending`, date to today |
| PATCH | `/api/tasks/:id/timer` | Log elapsed time | Auto-marks done if logged time ≥ target |
| PATCH | `/api/tasks/:id/comment` | Update a task's comment | |
| PATCH | `/api/tasks/:id/edit` | Edit task fields | Returns `403` if task status is `buffer`; date is not editable |
| DELETE | `/api/tasks/:id` | Delete a task | Returns `403` if task status is `buffer` |

---

## Author

**MD. Shawon Hossain (Arham)**  
Final-year CSE Student, BRAC University  
· [GitHub](https://github.com/devbyshawon) · [LinkedIn](https://www.linkedin.com/in/devbyshawon-/)

---

## License

This project is open source and available under the [LICENSE](./LICENSE).