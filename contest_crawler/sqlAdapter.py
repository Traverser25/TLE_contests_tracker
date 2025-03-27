import sqlite3
from datetime import datetime
import re

class DatabaseHandler:
    """Handles SQLite operations for contest data."""
    
    def __init__(self, db_path="contest_tracker.db"):
        """Initialize SQLite connection."""
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        self.create_table()
    
    def create_table(self):
        """Create contests table if it does not exist."""
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS crawled_contests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contest_id TEXT UNIQUE,
                name TEXT,
                date TEXT,
                status TEXT,
                duration TEXT,
                platform_id TEXT,
                solution_link TEXT,
                contest_link TEXT
            )
        ''')
        self.conn.commit()

    def upsert_contest(self, contest_data):
        """Insert a new contest if it does not exist, update it otherwise."""
        self.cursor.execute('''
            INSERT INTO crawled_contests (contest_id, name, date, status, duration, platform_id, solution_link, contest_link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(contest_id) DO UPDATE SET
                name=excluded.name,
                date=excluded.date,
                status=excluded.status,
                duration=excluded.duration,
                platform_id=excluded.platform_id,
                solution_link=excluded.solution_link,
                contest_link=excluded.contest_link;
        ''', (contest_data["contest_id"], contest_data["name"], contest_data["date"], 
              contest_data["status"], contest_data["duration"], contest_data["platform_id"],
              contest_data["solution_link"], contest_data["contest_link"]))
        self.conn.commit()
        print(f"Upserted contest: {contest_data['contest_id']} - {contest_data['name']}")

    def update_contest_status(self):
        """Updates the status of contests from 'BEFORE' to 'FINISHED' if past start time."""
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.cursor.execute('''
            UPDATE crawled_contests
            SET status = 'FINISHED'
            WHERE status = 'BEFORE' AND date <= ?
        ''', (current_time,))
        self.conn.commit()
        print("Contest status update completed.")
    
    def extract_contest_info(self, contest_name):
        """Extracts platform name and contest number from contest name."""
        match = re.search(r"(codeforces|leetcode|codechef).*?(\d+)", contest_name, re.IGNORECASE)
        if match:
            platform, contest_number = match.groups()
            return rf"{platform}.*?{contest_number}"
        return None

    def update_solution_link(self, platform_id, contest_number, solution_link):
        """Updates the solution_link for a contest based on platform_id and contest number."""
        platform_map = {
            "Codeforces": "CF1",
            "Leetcode": "LC2",
            "Codechef": "CC3"
        }
        platform_name = platform_map.get(platform_id)
        if not platform_name:
            print(f"Invalid platform ID: {platform_id}")
            return
        
        self.cursor.execute('''
            UPDATE crawled_contests
            SET solution_link = ?
            WHERE platform_id = ? AND name LIKE ? AND (solution_link IS NULL OR solution_link = '')
        ''', (solution_link, platform_name, f"%{contest_number}%"))
        
        if self.cursor.rowcount > 0:
            print(f"Solution link updated for {platform_name} Contest {contest_number}.")
        else:
            print(f"No matching contest found or solution link already exists for {platform_name} {contest_number}.")
        
        self.conn.commit()




    def show_top_10_entries(self):
        """Fetch and display the top 10 contests sorted by date."""
        self.cursor.execute("SELECT * FROM crawled_contests ORDER BY date DESC LIMIT 10")
        contests = self.cursor.fetchall()
        
    
        for contest in contests:
           print(contest)

    def close_connection(self):
        """Close the SQLite connection."""
        self.conn.close()


# db=DatabaseHandler() 
# db.show_top_10_entries()             


