# Habit Tracker

A full-stack habit tracking app built with Flask and React. Track daily and weekly habits, monitor streaks, and view completion stats — with an optimistic UI that responds instantly.

**Live:** [habit-tracker-six-flame.vercel.app](https://habit-tracker-six-flame.vercel.app)

---

## Features

- **Daily & weekly habits** — each tracked on its own cadence, streaks calculated correctly per type
- **Accurate completion rates** — denominator is each habit's own creation date, not a shared baseline
- **Per-habit stats** — current streak, longest streak, completion %, last 7 days
- **Global stats** — overall streak, completion rate, 7-day bar chart
- **Optimistic UI** — screen updates instantly on every action; rolls back silently on failure
- **Concurrency-safe revalidation** — request ID system discards stale responses
- **Polling fallback** — 60-second background refresh with interval reset after mutations

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Python · Flask · SQLite |
| Frontend | React · Context API · Axios |
| Hosting | Railway (backend) · Vercel (frontend) |

---

## Architecture

```
habit-tracker/
├── backend/
│   ├── app.py          # Routes: habits CRUD, completions, stats
│   ├── db.py           # SQLite connection, schema init
│   ├── services.py     # Global stats logic
│   ├── requirements.txt
│   ├── Procfile
│   └── railway.toml
└── frontend/
    └── src/
        ├── api.js                    # Axios service layer
        ├── context/HabitContext.js   # Global state, mutations, polling
        ├── components/
        │   ├── HabitItem.js          # Expand/collapse, per-habit stats
        │   ├── HabitList.js
        │   └── Stats.js              # Global stats + bar chart
        ├── App.js
        └── LandingPage.js
```

---

## Local Development

**Backend**

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

**Frontend**

```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:5000" > .env.local
npm start
# Runs on http://localhost:3000
```

---

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/habits` | List all habits |
| `POST` | `/habits` | Create a habit `{ name, type: "daily"\|"weekly" }` |
| `DELETE` | `/habits/:id` | Delete a habit |
| `POST` | `/habits/:id/complete` | Mark complete for today |
| `GET` | `/habits/:id/stats` | Per-habit stats |
| `GET` | `/stats` | Global stats |

---

## Deployment

**Backend → Railway**

1. Connect GitHub repo · set root directory to `backend`
2. Add environment variables:
   ```
   DATABASE_PATH = /data/habits.db
   FRONTEND_URL  = https://your-app.vercel.app
   ```
3. Add a volume mounted at `/data`

**Frontend → Vercel**

1. Connect GitHub repo · set root directory to `frontend`
2. Add environment variable:
   ```
   REACT_APP_API_URL = https://your-api.railway.app
   ```

---

## How streak logic works

- **Daily habits** — consecutive calendar days ending today (or yesterday if today not yet done)
- **Weekly habits** — consecutive ISO weeks with at least one completion, using `date.fromisocalendar()` for correct year-boundary handling
- **Completion rate** — `completions / total_possible` where `total_possible` is days (daily) or `ceil(days/7)` (weekly) since that habit's creation date
