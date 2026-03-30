import sqlite3
import os

DATABASE = os.environ.get("DATABASE_PATH", "habits.db")


def get_db():
    print("DB PATH:", DATABASE)
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA synchronous = FULL")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('daily', 'weekly')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS completions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            completed_date DATE NOT NULL,
            FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
            UNIQUE(habit_id, completed_date)
        );
        CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(completed_date);
    """)
    conn.commit()
    # Migrate: add user_id column if not already present
    try:
        conn.execute("ALTER TABLE habits ADD COLUMN user_id TEXT NOT NULL DEFAULT ''")
        conn.commit()
    except Exception:
        pass  # column already exists
    conn.close()
