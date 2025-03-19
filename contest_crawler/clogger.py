import pymongo
import datetime
from constants import Constant



class MongoLogger:
    def __init__(self, mongo_uri=Constant.MONGO_URI, db_name="contest_tracker", collection_name="contest_logs"):
        """Initialize MongoDB connection and select the database and collection."""
        self.client = pymongo.MongoClient(mongo_uri)
        self.db = self.client[db_name]
        self.collection = self.db[collection_name]

    def log(self, level, message):
        """Insert a log entry into MongoDB."""
        log_entry = {
            "timestamp": datetime.datetime.utcnow(),
            "level": level.upper(),
            "message": message
        }
        self.collection.insert_one(log_entry)
        print(f"Logged: {level.upper()} - {message}")

    def info(self, message):
        """Log an info message."""
        self.log("INFO", message)

    def warning(self, message):
        """Log a warning message."""
        self.log("WARNING", message)

    def error(self, message):
        """Log an error message."""
        self.log("ERROR", message)

    def get_logs(self, level=None, limit=10):
        """Retrieve logs from MongoDB (filtered by level if provided)."""
        query = {"level": level.upper()} if level else {}
        return list(self.collection.find(query).sort("timestamp", -1).limit(limit))



# if __name__ == "__main__":
#     logger = MongoLogger()

#     logger.info("This is an info log.")
#     logger.warning("This is a warning log.")
#     logger.error("This is an error log.")

#     print("Recent Logs:")
#     for log in logger.get_logs():
#         print(log)