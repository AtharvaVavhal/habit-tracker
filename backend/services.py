from db import get_db
from datetime import date, timedelta
import math


def get_global_stats(user_id):
    db = get_db()
    try:
        streak = _calc_global_streak(db, user_id)
        completion_rate = _calc_completion_rate(db, user_id)
        last_7 = _calc_last_7_days(db, user_id)
        return {
            "streak": streak,
            "completion_rate": completion_rate,
            "last_7_days": last_7,
        }
    finally:
        db.close()


def _calc_global_streak(db, user_id):
    rows = db.execute(
        """
        SELECT DISTINCT c.completed_date
        FROM completions c
        JOIN habits h ON c.habit_id = h.id
        WHERE h.user_id = ?
        ORDER BY c.completed_date DESC
        """,
        (user_id,),
    ).fetchall()

    if not rows:
        return 0

    dates = [row["completed_date"] for row in rows]
    streak = 0
    check = date.today()

    if dates[0] != check.isoformat():
        check -= timedelta(days=1)

    for d in dates:
        if d == check.isoformat():
            streak += 1
            check -= timedelta(days=1)
        elif d < check.isoformat():
            break

    return streak


def _calc_completion_rate(db, user_id):
    habits = db.execute(
        "SELECT type, DATE(created_at) as created FROM habits WHERE user_id = ?",
        (user_id,),
    ).fetchall()
    if not habits:
        return 0.0

    today = date.today()
    total_possible = 0
    for h in habits:
        days_since = (today - date.fromisoformat(h["created"])).days + 1
        if h["type"] == "weekly":
            total_possible += math.ceil(days_since / 7)
        else:
            total_possible += days_since

    if total_possible == 0:
        return 0.0

    total_done = db.execute(
        """
        SELECT COUNT(*) as cnt
        FROM completions c
        JOIN habits h ON c.habit_id = h.id
        WHERE h.user_id = ?
        """,
        (user_id,),
    ).fetchone()["cnt"]

    return round((total_done / total_possible) * 100, 1)


def _calc_last_7_days(db, user_id):
    today = date.today()
    start = today - timedelta(days=6)

    rows = db.execute(
        """
        SELECT c.completed_date, COUNT(*) as completed
        FROM completions c
        JOIN habits h ON c.habit_id = h.id
        WHERE h.user_id = ? AND c.completed_date >= ? AND c.completed_date <= ?
        GROUP BY c.completed_date
        """,
        (user_id, start.isoformat(), today.isoformat()),
    ).fetchall()

    counts = {row["completed_date"]: row["completed"] for row in rows}

    return [
        {
            "date": (start + timedelta(days=i)).isoformat(),
            "completed": counts.get((start + timedelta(days=i)).isoformat(), 0),
        }
        for i in range(7)
    ]
