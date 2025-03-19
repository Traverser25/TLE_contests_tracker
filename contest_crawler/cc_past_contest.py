import requests
import json
import re
from datetime import datetime


def extract_contest_details(data):
    if not isinstance(data, dict) or data.get("status") != "success":
        return "Failed to fetch contest data"

    contests = data.get("contests", [])
    extracted_contests = []

    for contest in contests:
        start_date_raw = contest.get("contest_start_date", "")
        
        formatted_start_date = (
            datetime.strptime(start_date_raw, "%d %b %Y %H:%M:%S").strftime("%Y-%m-%d %H:%M:%S")
            if start_date_raw
            else ""
        )

        duration_mins = int(contest.get("contest_duration", 0))
        hours = duration_mins // 60
        minutes = duration_mins % 60
        formatted_duration = f"{hours} Hr {minutes} m" if hours else f"{minutes} m"

        contest_entry = {
            "contest_id": contest.get("contest_code", ""),
            "name": contest.get("contest_name", ""),
            "date": formatted_start_date,  # Now includes time
            "status": "FINISHED",
            "duration": formatted_duration,  # Updated format
            "platform_id": "CC3",
            "solution_link": "",
            "contest_link": f"https://www.codechef.com/{contest.get('contest_code', '')}"
        }
        extracted_contests.append(contest_entry)

    return extracted_contests


# Define the API URL
url = "https://www.codechef.com/api/list/contests/past"

# Define query parameters
params = {
    "sort_by": "START",
    "sorting_order": "desc",
    "offset": 30,
    "mode": "all"
}

# Define headers (modify `cookie` value as needed)
headers = {
    "accept": "application/json, text/plain, */*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.9",
    "referer": "https://www.codechef.com",
    "cookie": "SESS93b6022d778ee317bf48f7dbffe03173=1722da6027e65f941bbd217cef921c45; _gcl_au=1.1.162372127.1742113226; _gid=GA1.2.1615283480.1742113226; _clck=o728pf%7C2%7Cfua%7C0%7C1902; _ga_C8RQQ7NY18=GS1.1.1742291343.8.1.1742291358.45.0.0; _ga=GA1.2.1746377029.1733120079"  # Replace with your actual session cookie

}
# Make the request
response = requests.get(url, headers=headers, params=params)
data = response.json()



from db_operations import DatabaseHandler

db=DatabaseHandler()

result = extract_contest_details(data)
for  contest in result:
   db.upsert_contest(contest)