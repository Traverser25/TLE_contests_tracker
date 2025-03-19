# Importing datetime module
import datetime

# Calling the fromtimestamp() function to
# extract datetime from the given timestamp

# Calling the strftime() function to convert
# the extracted datetime into its string format

def  format_cf_date(number):
    return(datetime.datetime.fromtimestamp(int(number))
	.strftime('%Y-%m-%d %H:%M:%S'))


def parse_starts_in(start_date_text, starts_in_text):
    """Convert 'Starts In' (e.g., '2 Days\n5 Hrs') to exact start timestamp using Start Date."""

    # Convert start_date_text to datetime (default time = midnight)
    start_time = datetime.datetime.strptime(start_date_text, '%d %b %Y')
    
    # Normalize the string (replace '\n' with space for easy parsing)
    starts_in_text = starts_in_text.replace("\n", " ")

    # Extract days and hours
    days, hours = 0, 0
    parts = starts_in_text.split()
    for i in range(len(parts)):
        if "Day" in parts[i]:
            days = int(parts[i - 1])
        elif "Hr" in parts[i]:
            hours = int(parts[i - 1])

    # Adjust time
    start_time -= datetime.timedelta(days=days, hours=hours)

    # Return formatted date-time string
    return start_time.strftime('%Y-%m-%d %H:%M:%S')

def date_format_lc(date_str):
    """Convert '26 Mar 2025 20:00' → '2025-03-26 20:00:00'."""
    try:
        # Parse input date string
        dt_obj = datetime.datetime.strptime(date_str, "%d %b %Y %H:%M")
        
        # Convert to required format
        return dt_obj.strftime("%Y-%m-%d %H:%M:%S")

    except Exception as e:
        print(f"Error formatting date: {e}")
        return None

# # Example usage:
# date_input = "26 Mar 2025 20:00"
# formatted_date = date_format_lc(date_input)
# print(formatted_date)  # Output: "2025-03-26 20:00:00"


import re

# def extract_contest_details(contest_name):
#     patterns = [
#         (r"codeforces.*?(round)\s*(\d+)", "Codeforces"),  # Extracts "Round" & Number
#         (r"leetcode.*?(weekly\s*contest)\s*(\d+)", "Leetcode"),  # Extracts "Weekly Contest" & Number
#         (r"codechef.*?(starters)\s*(\d+)", "Codechef")  # Extracts "Starters" & Number
#     ]
    
#     for pattern, platform in patterns:
#         match = re.search(pattern, contest_name, re.IGNORECASE)
#         if match:
#             return {
#                 "platform": platform,
#                 "keyword": match.group(1),  # Extracts "Round", "Weekly Contest", or "Starters"
#                 "number": int(match.group(2))  # Extracts contest number
#             }
    
#     return None  # Return None if no match is found

# # Example Usage
# test_cases = [
#     " div 2  sol Codeforces Round 123",
#     "Leetcode Weekly Contest 456 [Div. 2]",
#     "Codechef Starters 78 (Practice)",
#     "Codeforces Round 999 (Global)",
#     "Leetcode Weekly Contest 321 - Biweekly",
#     "Some Random Contest Name"
# ]

# for contest in test_cases:
#     details = extract_contest_details(contest)
#     print(f"Contest: {contest} → {details}")
