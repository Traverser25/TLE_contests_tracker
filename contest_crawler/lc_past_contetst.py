import requests
import re
import json
from datetime import datetime

from db_operations import DatabaseHandler

db=DatabaseHandler()

# Define the GraphQL endpoint
url = "https://leetcode.com/graphql"

# Define the GraphQL query
query = """
    query pastContests($pageNo: Int, $numPerPage: Int) {
      pastContests(pageNo: $pageNo, numPerPage: $numPerPage) {
        data {
          title
          titleSlug
          startTime
          originStartTime
        }
      }
    }
"""

# Define query variables
variables = {"pageNo":13, "numPerPage": 10}  # Adjust as needed

# Send the request
response = requests.post(url, json={"query": query, "variables": variables})
data = response.json()

# Extract contest information
contest_list = []

if "data" in data and "pastContests" in data["data"]:
    contests = data["data"]["pastContests"]["data"]
    
    for contest in contests:
        # Extract contest ID from title using regex
        match = re.search(r'(\d+)$', contest["title"])
        contest_id = match.group(1) if match else "UNKNOWN"

        # Convert timestamp to readable format
        start_timestamp = contest["startTime"]
        start_time = datetime.utcfromtimestamp(start_timestamp).strftime('%Y-%m-%d %H:%M:%S')

        # Assuming standard duration for LeetCode contests
        duration_hours = 1
        duration_minutes = 30

        contest_entry = {
            "contest_id": contest_id,
            "name": contest["title"],
            "date": start_time,
            "status": "FINISHED",
            "duration": f"{duration_hours}h {duration_minutes}m",
            "platform_id": "LC2",
            "solution_link": "",
            "contest_link": f"https://leetcode.com/contest/{contest['titleSlug']}"
        }
        
        contest_list.append(contest_entry)

# Print JSON response
for  contest in contest_list:
    db.upsert_contest(contest)
