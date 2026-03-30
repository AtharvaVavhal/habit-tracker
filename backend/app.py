from flask import Flask, jsonify, request
from flask_cors import CORS
from db import get_db, init_db
from services import get_global_stats
from datetime import date, timedelta
import math
import os

app = Flask(__name__)
CORS(app, origins=os.environ.get("FRONTEND_URL", "http://localhost:3000"))


def get_user_id():
    """Extract userId from query params (GET) or JSON body (POST/DELETE)."""
    uid = request.args.get("userId") or (request.get_json(silent=True) or {}).get("userId", "")
    return uid.strip() if uid else ""


@app.route("/")
def index():
    return jsonify({"message": "Backend is running"})

@app.route("/debug/db")
def debug_db():
    from db import DATABASE
    db_path = DATABASE
    file_exists = os.path.exists(db_path)
    file_size = os.path.getsize(db_path) if file_exists else None
    data_dir_exists = os.path.exists("/data")
    data_dir_contents = os.listdir("/data") if data_dir_exists else []
    try:
        db = get_db()
        habit_count = db.execute("SELECT COUNT(*) as cnt FROM habits").fetchone()["cnt"]
        habits = [dict(h) for h in db.execute("SELECT * FROM habits").fetchall()]
        db.close()
        db_readable = True
    except Exception as e:
        habit_count = None
        habits = []
        db_readable = str(e)
    return jsonify({
        "db_path": db_path,
        "file_exists": file_exists,
        "file_size_bytes": file_size,
        "data_dir_exists": data_dir_exists,
        "data_dir_contents": data_dir_contents,
        "db_readable": db_readable,
        "habit_count": habit_count,
        "habits": habits,
    })

# --- HABITS CRUD ---

@app.route("/habits", methods=["GET"])
def get_habits():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    today = date.today().isoformat()
    db = get_db()
    rows = db.execute(
        """
        SELECT h.*,
               CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END AS completed_today
        FROM habits h
        LEFT JOIN completions c
          ON c.habit_id = h.id AND c.completed_date = ?
        WHERE h.user_id = ?
        """,
        (today, user_id),
    ).fetchall()
    habits = [dict(row) for row in rows]
    db.close()
    return jsonify(habits)

@app.route("/habits", methods=["POST"])
def create_habit():
    data = request.get_json()
    user_id = (data.get("userId") or "").strip()
    name = data.get("name", "").strip()
    habit_type = data.get("type", "daily")

    if not user_id:
        return jsonify({"error": "userId is required"}), 400
    if not name:
        return jsonify({"error": "Name is required"}), 400
    if habit_type not in ("daily", "weekly"):
        return jsonify({"error": "Type must be 'daily' or 'weekly'"}), 400

    db = get_db()
    cursor = db.execute(
        "INSERT INTO habits (name, type, user_id) VALUES (?, ?, ?)",
        (name, habit_type, user_id),
    )
    db.commit()
    habit = db.execute("SELECT * FROM habits WHERE id = ?", (cursor.lastrowid,)).fetchone()
    db.close()
    return jsonify(dict(habit)), 201

@app.route("/habits/<int:habit_id>", methods=["DELETE"])
def delete_habit(habit_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    db = get_db()
    db.execute("DELETE FROM habits WHERE id = ? AND user_id = ?", (habit_id, user_id))
    db.commit()
    db.close()
    return jsonify({"message": "Deleted"}), 200

# --- COMPLETIONS ---

@app.route("/habits/<int:habit_id>/complete", methods=["POST"])
def complete_habit(habit_id):
    data = request.get_json() or {}
    user_id = data.get("userId", "").strip()
    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    today = date.today().isoformat()
    db = get_db()

    habit = db.execute(
        "SELECT id FROM habits WHERE id = ? AND user_id = ?", (habit_id, user_id)
    ).fetchone()
    if not habit:
        db.close()
        return jsonify({"error": "Habit not found"}), 404

    existing = db.execute(
        "SELECT id FROM completions WHERE habit_id = ? AND completed_date = ?",
        (habit_id, today),
    ).fetchone()

    if existing:
        db.close()
        return jsonify({"message": "Already completed today"}), 200

    db.execute(
        "INSERT INTO completions (habit_id, completed_date) VALUES (?, ?)",
        (habit_id, today),
    )
    db.commit()
    db.close()
    return jsonify({"message": "Marked as done"}), 201

# --- STATS ---

@app.route("/stats", methods=["GET"])
def global_stats():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "userId is required"}), 400
    return jsonify(get_global_stats(user_id))

@app.route("/habits/<int:habit_id>/stats", methods=["GET"])
def get_stats(habit_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    db = get_db()

    habit = db.execute(
        "SELECT * FROM habits WHERE id = ? AND user_id = ?", (habit_id, user_id)
    ).fetchone()
    if not habit:
        db.close()
        return jsonify({"error": "Habit not found"}), 404

    rows = db.execute(
        "SELECT completed_date FROM completions WHERE habit_id = ? ORDER BY completed_date DESC",
        (habit_id,),
    ).fetchall()
    dates = [row["completed_date"] for row in rows]
    habit_type = habit["type"]

    current_streak = calc_current_streak(dates, habit_type)
    longest_streak = calc_longest_streak(dates, habit_type)

    created = date.fromisoformat(habit["created_at"][:10])
    days_since = (date.today() - created).days + 1
    if habit_type == "weekly":
        total_possible = math.ceil(days_since / 7)
        completed_count = len(set(date.fromisoformat(d).isocalendar()[:2] for d in dates))
    else:
        total_possible = days_since
        completed_count = len(dates)
    completion_pct = round((completed_count / total_possible) * 100, 1) if total_possible > 0 else 0

    today = date.today()
    dates_set = set(dates)
    last_7 = [(today - timedelta(days=i)).isoformat() for i in range(6, -1, -1)]
    last_7_days = [{"date": d, "completed": 1 if d in dates_set else 0} for d in last_7]

    db.close()
    return jsonify({
        "habit_id": habit_id,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "completion_percentage": completion_pct,
        "last_7_days": last_7_days,
    })


def calc_current_streak(dates, habit_type):
    if not dates:
        return 0
    if habit_type == "weekly":
        return _current_streak_weekly(dates)
    return _current_streak_daily(dates)


def _current_streak_daily(dates):
    today = date.today()
    check = today
    if dates[0] != today.isoformat():
        yesterday = (today - timedelta(days=1)).isoformat()
        if dates[0] != yesterday:
            return 0
        check = today - timedelta(days=1)
    streak = 0
    for d in dates:
        if d == check.isoformat():
            streak += 1
            check -= timedelta(days=1)
        elif d < check.isoformat():
            break
    return streak


def _current_streak_weekly(dates):
    completed_weeks = set(date.fromisoformat(d).isocalendar()[:2] for d in dates)
    today = date.today()
    check_week = today.isocalendar()[:2]
    if check_week not in completed_weeks:
        last_week = (today - timedelta(days=7)).isocalendar()[:2]
        if last_week not in completed_weeks:
            return 0
        check_week = last_week
    streak = 0
    while check_week in completed_weeks:
        streak += 1
        year, week = check_week
        prev = date.fromisocalendar(year, week, 1) - timedelta(days=7)
        check_week = prev.isocalendar()[:2]
    return streak


def calc_longest_streak(dates, habit_type):
    if not dates:
        return 0
    if habit_type == "weekly":
        return _longest_streak_weekly(dates)
    return _longest_streak_daily(dates)


def _longest_streak_daily(dates):
    sorted_dates = sorted(set(dates))
    longest = current = 1
    for i in range(1, len(sorted_dates)):
        prev = date.fromisoformat(sorted_dates[i - 1])
        curr = date.fromisoformat(sorted_dates[i])
        if (curr - prev).days == 1:
            current += 1
            longest = max(longest, current)
        else:
            current = 1
    return longest


def _longest_streak_weekly(dates):
    weeks = sorted(set(date.fromisoformat(d).isocalendar()[:2] for d in dates))
    longest = current = 1
    for i in range(1, len(weeks)):
        py, pw = weeks[i - 1]
        cy, cw = weeks[i]
        prev_mon = date.fromisocalendar(py, pw, 1)
        curr_mon = date.fromisocalendar(cy, cw, 1)
        if (curr_mon - prev_mon).days == 7:
            current += 1
            longest = max(longest, current)
        else:
            current = 1
    return longest


init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
