from db import get_db
from datetime import date, timedelta
import math


def get_global_stats():
    db = get_db()
    try:
        streak = _calc_global_streak(db)
        completion_rate = _calc_completion_rate(db)
        last_7 = _calc_last_7_days(db)
        return {
            "streak": streak,
            "completion_rate": completion_rate,
            "last_7_days": last_7,
        }
    finally:
        db.close()


def _calc_global_streak(db):
    """Consecutive days (ending today or yesterday) where at least 1 habit was completed."""
    rows = db.execute(
        """
        SELECT DISTINCT completed_date
        FROM completions
        ORDER BY completed_date DESC
        """
    ).fetchall()

    if not rows:
        return 0

    dates = [row["completed_date"] for row in rows]
    streak = 0
    check = date.today()

    # allow streak to start from yesterday if nothing done today yet
    if dates[0] != check.isoformat():
        check -= timedelta(days=1)

    for d in dates:
        if d == check.isoformat():
            streak += 1
            check -= timedelta(days=1)
        elif d < check.isoformat():
            break

    return streak


def _calc_completion_rate(db):
    """Sum each habit's individual possible completions based on type and creation date."""
    habits = db.execute("SELECT type, DATE(created_at) as created FROM habits").fetchall()
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

    total_done = db.execute("SELECT COUNT(*) as cnt FROM completions").fetchone()["cnt"]
    return round((total_done / total_possible) * 100, 1)


def _calc_last_7_days(db):
    """Per-day completion count for the last 7 days."""
    today = date.today()
    start = today - timedelta(days=6)

    rows = db.execute(
        """
        SELECT completed_date, COUNT(*) as completed
        FROM completions
        WHERE completed_date >= ? AND completed_date <= ?
        GROUP BY completed_date
        """,
        (start.isoformat(), today.isoformat()),
    ).fetchall()

    counts = {row["completed_date"]: row["completed"] for row in rows}

    return [
        {
            "date": (start + timedelta(days=i)).isoformat(),
            "completed": counts.get((start + timedelta(days=i)).isoformat(), 0),
        }
        for i in range(7)
    ]