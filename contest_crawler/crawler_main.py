import requests
import time
from time_formatter import format_cf_date
from constants import Constant
from db_operations import DatabaseHandler
from clogger import MongoLogger
import re 
import datetime
from time_formatter import  date_format_lc
from youtube_linker import youtube_routine


def leetcode_routine():
    """Fetches upcoming LeetCode contests, processes them, and updates MongoDB with retries, logging, and error handling."""
    
    db = DatabaseHandler()
    logger = MongoLogger()

    
    headers = {"Content-Type": "application/json"}

    query = {
        "query": """
        query upcomingContests {
            upcomingContests {
                title
                titleSlug
                startTime
                duration
            }
        }
        """
    }

    MAX_RETRIES = 5
    RETRY_DELAY = 5
    attempt = 0

    while attempt < MAX_RETRIES:
        try:
            logger.info(f"Fetching LeetCode contests (Attempt {attempt+1}/{MAX_RETRIES})...")
            response = requests.post(Constant.LC_URL, json=query, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            break  # Exit loop if request is successful

        except requests.exceptions.RequestException as e:
            logger.error(f"Network error: {str(e)}. Retrying in {RETRY_DELAY} seconds...")
            attempt += 1
            time.sleep(RETRY_DELAY)

    if attempt == MAX_RETRIES:
        logger.error("Max retries reached. Unable to fetch LeetCode contests.")
        return

    contests = data.get("data", {}).get("upcomingContests", [])
    
    if not contests:
        logger.info("No upcoming LeetCode contests found.")
        return

    contest_list = []
    
    try:
        for contest in contests:
            # Extract contest ID directly inside the loop
            match = re.search(r'(\d+)$', contest["title"])
            contest_id = match.group(1) if match else "UNKNOWN"

            start_time = datetime.datetime.utcfromtimestamp(contest["startTime"]).strftime('%Y-%m-%d %H:%M:%S')
            duration_seconds = contest["duration"]
            duration_hours = duration_seconds // 3600
            duration_minutes = (duration_seconds % 3600) // 60  # Get remaining minutes

            contest_entry = {
                "contest_id": contest_id,
                "name": contest["title"],
                "date": start_time,
                "status": "UPCOMING",
                "duration": f"{duration_hours}h {duration_minutes}m",  # Store as "Xh Ym"
                "platform_id": "LC2",
                "solution_link": "",
                "contest_link": f"https://leetcode.com/contest/{contest['titleSlug']}"
            }
            contest_list.append(contest_entry)

        if contest_list:
            for contest in contest_list:
                db.upsert_contest(contest)

            logger.info(f"Inserted {len(contest_list)} LeetCode contest records into MongoDB.")
        else:
            logger.info("No new contests to insert.")

    except Exception as e:
        logger.error(f"Unexpected error in LeetCode routine: {str(e)}")

    finally:
        db.close_connection()  # Close DB connection






def codechef_routine():
    """Fetches upcoming CodeChef contests, processes them, and updates MongoDB with retries and logging."""
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.webdriver import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    import time

    db = DatabaseHandler()
    logger = MongoLogger()

    url = "https://www.codechef.com/contests"

    options = Options()
    options.add_argument("--headless")  
    options.add_argument("--disable-gpu")  
    options.add_argument("--no-sandbox")  
    options.add_argument("--disable-dev-shm-usage")  

    MAX_RETRIES = 5
    RETRY_DELAY = 5
    attempt = 0

    while attempt < MAX_RETRIES:
        try:
            logger.info(f"Fetching CodeChef contests (Attempt {attempt+1}/{MAX_RETRIES})...")
            driver = webdriver.Chrome(options=options)
            driver.get(url)
            time.sleep(5)  # Let the page load
            wait = WebDriverWait(driver, 20)

            # Locate the upcoming contests section
            contests_div = wait.until(EC.presence_of_element_located(
                (By.XPATH, "//p[contains(text(),'Upcoming Contests')]/ancestor::div[contains(@class, '_table__container')]")
            ))
            break  # Exit loop if successful

        except Exception as e:
            logger.error(f"Error fetching CodeChef contests: {str(e)}. Retrying in {RETRY_DELAY} seconds...")
            attempt += 1
            time.sleep(RETRY_DELAY)
            if attempt == MAX_RETRIES:
                logger.error("Max retries reached. Unable to fetch CodeChef contests.")
                return

    # Extract contest details
    contest_rows = contests_div.find_elements(By.XPATH, ".//tr[contains(@class, 'MuiTableRow-root')]")
    contest_list = []

    try:
        for row in contest_rows:
            try:
                contest_id = row.find_element(By.XPATH, ".//td[1]//p").text.strip()  # Use "Code" as contest_id
                name = row.find_element(By.XPATH, ".//td[2]//a").text.strip()
                link = row.find_element(By.XPATH, ".//td[2]//a").get_attribute("href")
                start_date = row.find_element(By.XPATH, ".//td[3]//p").text.strip()
                try:
                    time_text = row.find_element(By.XPATH, ".//td[3]//p[contains(@class, '_grey__text_7s2sw_462')]").text.strip()
                    time_text = time_text.split()[-1]  # Extract just the time part (e.g., "20:00")
                except Exception as e:
                    print("no div found  ",  e )
                duration = row.find_element(By.XPATH, ".//td[4]//p").text.strip()
                
                
                contest_entry = {
                    "contest_id": contest_id,
                    "name": name,
                    "date":date_format_lc (f"{start_date} {time_text}"),
                    "status": "UPCOMING",
                    "duration": duration,
                    "platform_id": "CC3",
                    "solution_link": "",
                    "contest_link": link
                }
                contest_list.append(contest_entry)

            except Exception as e:
                logger.error(f"Error extracting a contest row: {str(e)}")

        if contest_list:
            for contest in contest_list:
                db.upsert_contest(contest)

            logger.info(f"Inserted {len(contest_list)} CodeChef contest records into MongoDB.")
        else:
            logger.info("No upcoming CodeChef contests found.")

    except Exception as e:
        logger.error(f"Unexpected error in CodeChef routine: {str(e)}")

    finally:
        driver.quit()
        db.close_connection()


def codeforces_routine():
    """Fetches Codeforces contests, processes them, and updates MongoDB with retries, logging, and error handling."""
    db = DatabaseHandler()
    logger = MongoLogger()
    
    MAX_RETRIES = 5  # Retry up to 5 times
    RETRY_DELAY = 5   # Wait 5 seconds between retries

    attempt = 0
    while attempt < MAX_RETRIES:
        try:
            logger.info(f"Fetching Codeforces contests (Attempt {attempt+1}/{MAX_RETRIES})...")
            response = requests.get(Constant.CF_API_URL, timeout=10)  # 10s timeout
            response.raise_for_status()  # Raise exception if request fails
            data = response.json()
            break  # Exit loop if request is successful

        except requests.exceptions.RequestException as e:
            logger.error(f"Network error: {str(e)}. Retrying in {RETRY_DELAY} seconds...")
            attempt += 1
            time.sleep(RETRY_DELAY)

    if attempt == MAX_RETRIES:
        logger.error("Max retries reached. Unable to fetch Codeforces contests.")
        return

    contests = []
    contest_count = 0

    try:
        for contest in data["result"]:
            contest_id = contest["id"]
            name = contest["name"]
            status = contest["phase"]
            contest_link = ""

            if status == "BEFORE":
                contest_link = "https://codeforces.com/contests"
            elif status == "FINISHED":
                contest_link = f"https://codeforces.com/contest/{contest_id}"

            # Convert startTimeSeconds to a readable date format if it exists
            if "startTimeSeconds" in contest:
                date = format_cf_date(int(contest["startTimeSeconds"]))
                duration_seconds = contest["durationSeconds"]
                duration_hours = duration_seconds // 3600
                duration_minutes = (duration_seconds % 3600) // 60  # Get remaining minutes
            else:
                date = "Unknown"
                duration_hours = 0
                duration_minutes = 0

            contest_data = {
                "contest_id": str(contest_id),
                "name": name,
                "date": date,
                "status": status,
                "duration": f"{duration_hours}h {duration_minutes}m",  # Store as "Xh Ym"
                "platform_id": "CF1",
                "solution_link": "",
                "contest_link": contest_link
            }

            db.upsert_contest(contest_data)
            contest_count += 1

            if contest_count >= 100:  # Process only the first 10 contests
                break

        logger.info(f"Successfully processed {contest_count} contests.")

    except Exception as e:
        logger.error(f"Unexpected error in Codeforces routine: {str(e)}")

    finally:
        db.close_connection()  # Close DB connection

# Run the function



if __name__ == "__main__":
    
    #codeforces_routine()
    # codechef_routine()
    # leetcode_routine()
    youtube_routine()
    #mailer routine 