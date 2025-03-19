import time
from db_operations import DatabaseHandler
from clogger import MongoLogger

db = DatabaseHandler()
logger = MongoLogger()

MAX_RETRIES = 3  

for attempt in range(1, MAX_RETRIES + 1):  
    try:  
        db.update_contest_status()  
        logger.info("Successfully updated contest statuses.")  
        break  # Exit loop if successful  
    except Exception as e:  
        logger.error(f"Attempt {attempt}: Error updating contest statuses: {str(e)}")  
        
        if attempt < MAX_RETRIES:  
            logger.info(f"Retrying in 1 minute... (Attempt {attempt + 1}/{MAX_RETRIES})")  
            time.sleep(60)  # Wait 1 minute before retrying  
