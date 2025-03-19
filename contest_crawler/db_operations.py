from pymongo import MongoClient
from  constants import Constant
import re

from datetime import datetime
class DatabaseHandler:
    """Handles MongoDB operations for contest data."""
    
    def __init__(self):
        """Initialize MongoDB connection with hardcoded values."""
        self.mongo_uri =Constant.MONGO_URI   # Change as needed
        self.db_name = "contest_tracker"
        self.collection_name = "crawled_contests"

        self.client = MongoClient(self.mongo_uri)
        self.db = self.client[self.db_name]
        self.collection = self.db[self.collection_name]

    def upsert_contest(self, contest_data):
        """
        Insert a new contest if it does not exist, update it otherwise.
        :param contest_data: Dictionary containing contest details
        """
        self.collection.update_one(
            {"contest_id": contest_data["contest_id"]},  
            {"$set": contest_data},     
            upsert=True  
        )
        print(f"Upserted contest: {contest_data['contest_id']} - {contest_data['name']}")

    
    def update_contest_status(self):
        """
        Updates the status of contests from 'BEFORE' to 'FINISHED' 
        if the current time is greater than the contest start time.
        """
        current_time = datetime.now()

        # Find all contests that are 'BEFORE' and need updating
        contests = self.collection.find({"status": "BEFORE"})

        for contest in contests:
            contest_date_str = contest.get("date")
            
            if not contest_date_str:
                continue  # Skip if there's no date field

            # Convert contest date string to datetime
            contest_date = datetime.strptime(contest_date_str, "%Y-%m-%d %H:%M:%S")

            # Compare with current time
            if current_time > contest_date:
                print("Found a contest to  update ")
                self.collection.update_one(
                    {"_id": contest["_id"]},
                    {"$set": {"status": "FINISHED"}}
                )
                print(f"Updated contest {contest['contest_id']} to FINISHED.")

        print("Contest status update completed.")

    def extract_contest_info(self ,contest_name):
        """
        Extracts platform name and contest number from a given contest name.
        Returns a regex pattern for fuzzy matching.
        """
        match = re.search(r"(codeforces|leetcode|codechef).*?(\d+)", contest_name, re.IGNORECASE)
        if match:
            platform, contest_number = match.groups()
            return rf"{platform}.*?{contest_number}"  # Dynamic regex with contest number
        return None  # If no match found, return None

    # def update_solution_link(self, contest_name, solution_link):
    #     """
    #     Updates the solution_link field for a contest matching the given name, 
    #     even if the contest name has slight variations.
        
    #     :param contest_name: Name of the contest (can have variations/typos).
    #     :param solution_link: Solution link to be updated.
    #     """
    #     regex_pattern =self. extract_contest_info(contest_name)
    #     if not regex_pattern:
    #         print(f"Could not extract contest info from: {contest_name}")
    #         return
        
    #     query = {
    #         "name": {"$regex": regex_pattern, "$options": "i"},  # Match platform + number
    #         "solution_link": {"$in": ["", None]}  # Update only if empty or None
    #     }
    #     update = {"$set": {"solution_link": solution_link}}

    #     result = self.collection.update_one(query, update)

    #     if result.modified_count > 0:
    #         print(f"Solution link updated for: {contest_name}")
    #     else:
    #         print(f"No matching contest found or solution link already exists for: {contest_name}")

    import re
    def update_solution_link(self, platform_id, contest_number, solution_link):
        """
        Updates the solution_link field for a contest based on platform_id and contest number.

        :param platform_id: Platform identifier (e.g., "CF1" for Codeforces).
        :param contest_number: The contest number (e.g., 1010 for "Codeforces Round 1010").
        :param solution_link: The solution link to be updated.
        """

        # Mapping of platform names to IDs
        platform_map = {
    "Codeforces": "CF1",
    "Leetcode": "LC2",
    "Codechef": "CC3"
}
        platform_name = platform_map.get(platform_id)
        if not platform_name:
            print(f"Invalid platform ID: {platform_id}")
            return

        # Fetch all contests for the given platform_id
        contests = list(self.collection.find({"platform_id": platform_name, "solution_link": {"$in": ["", None]}}))
        
        print(f"for  {platform_id } size is  {len(contests)}")
        # Iterate through contests and check if contest_number is in the name
        for contest in contests:
            contest_name = contest.get("name", "")

            # Check if contest number exists in contest name
            if str(contest_number) in contest_name:
                query = {"_id": contest["_id"]}
                update = {"$set": {"solution_link": solution_link}}
                result = self.collection.update_one(query, update)

                if result.modified_count > 0:
                    print(f"Solution link updated for {platform_name} Contest {contest_number}.")
                    return  # Exit after the first successful update

        print(f"No matching contest found or solution link already exists for {platform_name} {contest_number}.")


    def close_connection(self):
        """Close the MongoDB connection."""
        self.client.close()

#def 

#for i in "restingINPIECE"