import time
from selenium import webdriver
from bs4 import BeautifulSoup
from db_operations import DatabaseHandler
import re 
from clogger import MongoLogger

def is_valid_contest(contest_name):
    patterns = [
        r"codeforces.*round\s*\d+",          # Codeforces Round 123
        r"leetcode.*weekly\s*contest\s*\d+", # Leetcode Weekly Contest 123
        r"codechef.*starters\s*\d+"          # Codechef Starters 123
    ]
    return any(re.search(pattern, contest_name, re.IGNORECASE) for pattern in patterns)




def extract_contest_details(contest_name):
    patterns = [
        (r"codeforces.*?(round)\s*(\d+)", "Codeforces"),  # Extracts "Round" & Number
        (r"leetcode.*?(weekly\s*contest)\s*(\d+)", "Leetcode"),  # Extracts "Weekly Contest" & Number
        (r"codechef.*?(starters)\s*(\d+)", "Codechef")  # Extracts "Starters" & Number
    ]
    
    for pattern, platform in patterns:
        match = re.search(pattern, contest_name, re.IGNORECASE)
        if match:
            return {
                "platform": platform,
                "keyword": match.group(1),  # Extracts "Round", "Weekly Contest", or "Starters"
                "number": int(match.group(2))  # Extracts contest number
            }
    
    return None  # Return None if no match is found



#refinement , only take leetcode, codefirec or  codechef  
def youtube_routine():
    """Fetches recent YouTube videos from TLE Eliminators and updates solution links in MongoDB."""
    
    db = DatabaseHandler()
    logger = MongoLogger()

    # Set up Selenium WebDriver with original options
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  
    options.add_argument("--disable-gpu")  
    options.add_argument("--no-sandbox")  

    MAX_RETRIES = 5
    RETRY_DELAY = 5
    attempt = 0

    while attempt < MAX_RETRIES:
        try:
            logger.info(f"Fetching YouTube videos (Attempt {attempt+1}/{MAX_RETRIES})...")
            driver = webdriver.Chrome(options=options)
            driver.get("https://www.youtube.com/@TLE_Eliminators/videos")
            time.sleep(5)  # Let the page load

            # Scroll down multiple times to load more videos


            #ASSUMING TLE EXHAUST IN 50  pggaes  
            for _ in range(10):  
                driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight);")
                time.sleep(2)

            # Get page source and parse with BeautifulSoup
            soup = BeautifulSoup(driver.page_source, "html.parser")
            break  # Exit loop if successful

        except Exception as e:
            logger.error(f"Error fetching YouTube videos: {str(e)}. Retrying in {RETRY_DELAY} seconds...")
            attempt += 1
            time.sleep(RETRY_DELAY)
            if attempt == MAX_RETRIES:
                logger.error("Max retries reached. Unable to fetch YouTube videos.")
                return

    # Extract video details
    try:
        videos = soup.find_all("a", {"id": "video-title-link"})
        video_list = []

        for video in videos:
            try:
                title = video.text.strip()
                link = "https://www.youtube.com" + video["href"]

                # Extract contest name from title
                contest_name = title.split('|')[0].strip()
                



                contest_pro=extract_contest_details(contest_name)
                if contest_pro is not None:
                    #logger.info(f"Updating solution link for: {contest_name} -> {link}")
                      

                    #print(contest_pro)
                    # Update the solution link in the database
                    db.update_solution_link(contest_pro.get("platform"),contest_pro.get("number"),link)

                    video_list.append({"name": contest_name, "solution_link": link})
               

            except Exception as e:
                logger.error(f"Error extracting video details: {str(e)}")

        if video_list:
            logger.info(f"Updated {len(video_list)} contests with solution links.")
        else:
            logger.info("No matching contests found for solution links.")

    except Exception as e:
        logger.error(f"Unexpected error in YouTube routine: {str(e)}")

    finally:
        driver.quit()
        db.close_connection()

# Run the function
# if __name__ == "__main__":
#     youtube_routine()
