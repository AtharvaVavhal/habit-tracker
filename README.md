<div align="center">

# Habit Tracker

**A full-stack habit tracking app built with Flask and React.**

Track daily and weekly habits, monitor streaks, and view completion stats —
with an optimistic UI that responds instantly.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-black?style=flat-square)](https://habit-tracker-six-flame.vercel.app)
[![Backend](https://img.shields.io/badge/API-Railway-black?style=flat-square)](https://habit-tracker-production-5168.up.railway.app)
[![GitHub](https://img.shields.io/badge/GitHub-AtharvaVavhal-black?style=flat-square&logo=github)](https://github.com/AtharvaVavhal/habit-tracker)

</div>

---

## Overview

Habit Tracker is a minimal, production-deployed full-stack app with a Flask REST API, SQLite database, and a React frontend using Context API for state management.

It's built with engineering depth in mind — accurate streak algorithms, type-aware completion rates, optimistic updates with rollback, and concurrency-safe data fetching.

---

## Features

| | Feature | Detail |
|---|---|---|
| 📅 | **Daily & weekly habits** | Each tracked on its own cadence with type-aware streak logic |
| 📊 | **Accurate completion rates** | Denominator is each habit's own creation date, not a shared baseline |
| 🔥 | **Per-habit stats** | Current streak, longest streak, completion %, last 7 days |
| 🌍 | **Global stats** | Overall streak, completion rate, animated 7-day bar chart |
| ⚡ | **Optimistic UI** | Screen updates instantly; rolls back silently on API failure |
| 🔒 | **Concurrency-safe revalidation** | Request ID system discards out-of-order responses |
| 🔄 | **Polling fallback** | 60s background refresh with interval reset after mutations |

---

## Stack

| Layer | Technology |
|---|---|
| **Backend** | Python, Flask, SQLite, Gunicorn |
| **Frontend** | React, Context API, Axios |
| **Deployment** | Railway (backend) + Vercel (frontend) |

---

## Architecture

```
habit-tracker/
├── backend/
│   ├── app.py              # All routes: CRUD, completions, per-habit + global stats
│   ├── db.py               # SQLite connection, schema init, FK enforcement
│   ├── services.py         # Global stats: streak, completion rate, last 7 days
│   ├── requirements.txt
│   ├── Procfile
│   └── railway.toml
│
└── frontend/
    └── src/
        ├── api.js                      # Axios service layer — all API calls
        ├── context/
        │   └── HabitContext.js         # Global state, all mutations, polling
        ├── components/
        │   ├── HabitItem.js            # Per-habit expand/collapse + stats panel
        │   ├── HabitList.js            # Habit list consumer
        │   └── Stats.js                # Global stats + bar chart
        ├── App.js                      # Add habit form, layout
        └── LandingPage.js              # Marketing landing page
```

---

## Local Development

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# API running at http://localhost:5000
```

**Frontend**

```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:5000" > .env.local
npm start
# App running at http://localhost:3000
```

---

## API Reference

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `GET` | `/habits` | — | List all habits |
| `POST` | `/habits` | `{ name, type }` | Create a habit (`type`: `"daily"` or `"weekly"`) |
| `DELETE` | `/habits/:id` | — | Delete a habit (cascades completions) |
| `POST` | `/habits/:id/complete` | — | Mark complete for today (idempotent) |
| `GET` | `/habits/:id/stats` | — | Streak, completion %, last 7 days |
| `GET` | `/stats` | — | Global streak, completion rate, last 7 days |

---

## Deployment

**Backend → Railway**

```bash
# In Railway dashboard:
# 1. New Project → Deploy from GitHub → set Root Directory: backend
# 2. Add Volume mounted at /data
# 3. Set environment variables:
DATABASE_PATH=  /data/habits.db
FRONTEND_URL=   https://your-app.vercel.app
```

**Frontend → Vercel**

```bash
# In Vercel dashboard:
# 1. New Project → import GitHub repo → set Root Directory: frontend
# 2. Set environment variable:
REACT_APP_API_URL=  https://your-api.railway.app
```

---

## How the streak logic works

**Daily habits**
Consecutive calendar days ending today. If today has no completion yet, the streak counts from yesterday — so a habit completed at 11pm still shows a streak the next morning.

**Weekly habits**
Consecutive ISO weeks with at least one completion. Uses `date.fromisocalendar()` to avoid year-boundary bugs (some years have 53 weeks; week 1 can start in December).

**Completion rate**
```
rate = completions / total_possible × 100

total_possible:
  daily  → days since habit creation
  weekly → ceil(days_since_creation / 7)
```
Each habit uses its own creation date — adding a new habit today doesn't retroactively penalise your older habits.

---

## State management highlights

- `HabitContext` owns all shared state: `habits`, `globalStats`, `pendingIds`, `initialLoading`, `isRefreshing`, `error`
- `completeHabit` applies an optimistic update to `globalStats.last_7_days` immediately, saves a `previousStats` snapshot, and restores it on failure
- `revalidate()` uses an incrementing `revalidateIdRef` — only the latest request's response is applied, older ones are silently dropped
- Polling interval resets after every mutation so a stale poll can't overwrite a fresh revalidation

---

<div align="center">
  <sub>Built with Flask + React · Deployed on Railway + Vercel</sub>
</div>
