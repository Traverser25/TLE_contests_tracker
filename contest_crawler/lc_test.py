import requests
import datetime
from pymongo import MongoClient

# MongoDB connection URI
mongoURI = ""

# Connect to MongoDB
client = MongoClient(mongoURI)
db = client.get_database("contest_tracker")  # Database name
collection = db.get_collection("crawled_contests")  # Collection name
# API URL
url = "https://leetcode.com/graphql/"
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

# Fetch data from API
response = requests.post(url, json=query, headers=headers)

if response.status_code == 200:
    contests = response.json().get("data", {}).get("upcomingContests", [])
    
    # Process and insert into MongoDB
    contest_list = []
    for contest in contests:
        start_time = datetime.datetime.utcfromtimestamp(contest["startTime"]).strftime('%Y-%m-%d %H:%M:%S')
        duration_hours = contest["duration"] // 3600  # Convert duration to hours
        print(contest["title"])
        contest_entry = {
            "name": contest["title"],
            "url": f"https://leetcode.com/contest/{contest['titleSlug']}",
            "start_time": start_time,
            "duration_hours": duration_hours,
            "platform_id":"LC2"
        }
        contest_list.append(contest_entry)

    # Insert data into MongoDB
    if contest_list:
        collection.insert_many(contest_list)
        print(f"Inserted {len(contest_list)} LeetCode contest records into MongoDB.")
    else:
        print("No upcoming contests found.")
else:
    print("Failed to fetch contests:", response.text)
