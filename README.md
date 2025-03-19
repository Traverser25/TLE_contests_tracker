# 🏆 Contests Tracker  

🔗 video demo :-  https://drive.google.com/file/d/1CNmlFxwUjBfUWUzQw5IqAe3lyD9tn77j/view?usp=sharing

## 🚀 Overview  
**Contests Tracker** is a fully automated system that:  
- 📅 **Fetches live & past coding contests** from:  
  - **LeetCode API** 🟠  
  - **Codeforces API** 🔵  
  - **CodeChef Scraper** (Requests & selenium) 🟣  
- 🎥 **Scrapes and stores contest solution videos** from **TLE Eliminators YouTube Channel** using **Selenium**  
- 🗄 **Stores past 3 months of contest data** in **MongoDB**  
- 🔑 **User Authentication** – Login & Signup with JWT-based authentication  
- ⭐ **Bookmark Feature** – Users can save favorite contests for quick access  
- 🤖 **Runs automatically via Crontab** (No manual execution needed)  

---


---

## 📌 Key Features  
✅ **Live & Upcoming & Contests** – Fetched using **LeetCode & Codeforces APIs ,codechef with  selenium **  
✅ **Time Remaining for Contests** – Displays countdown ⏳ until the contest starts.
✅ **Past Contests Storage** – Maintains **past 1 week  to  3 months** of contest data  with  video  solutions from tle  eliminators
✅ **Youtube video  Solution Scraper** – Fetches **TLE Eliminators** solution videos using **Selenium**  automatically
✅ **Login & Signup** – Secure authentication using JWT  
✅ **Bookmark Contests** – Users can save contests for quick access  and retrieve  it 
✅ **Runs on Crontab** – No need for manual execution  
✅ **Separate Services** – Backend, Crawler, and Frontend are independent  
✅ **Dedicated Past Contests Fetcher** – A separate module fetches and stores past contests from Codeforces, LeetCode, and CodeChef  

---

## 🏗 **System Architecture**  

The project is designed as **three independent services** that interact only through the **MongoDB database**:  

### 1️⃣ **Crawler (Python Implementation) 🐍**  
- **Handles all contest & solution fetching**  
- Uses **Requests + BeautifulSoup** for **LeetCode, Codeforces, and CodeChef** contests  
- Uses **Selenium** for fetching **YouTube solutions**  
- **Runs automatically via Crontab** on the server (No direct interaction with backend)  
- Saves all fetched data directly into **MongoDB**  

### 2️⃣ **Backend API (Node.js) 🟢**  
- **Completely separate from the crawler**  
- Uses **Express.js** to serve contest & solution data  
- Handles **user authentication (JWT-based login & signup)**  
- Provides **bookmarking & user dashboard features**  
- Fetches contest data **directly from MongoDB** (No need to interact with the crawler)  

### 3️⃣ **Frontend (React) ⚛️**  
- **Completely separate from backend & crawler**  
- Fetches contest & solution data via backend API  
- Provides **user authentication, bookmarking, and contest dashboard**  
- Uses **React hooks & state management** for a smooth experience  

### 🛠 **How They Communicate**  
- **Crawler → MongoDB** → Fetches contests, scrapes solutions, and stores them  
- **Backend → MongoDB** → Reads data & provides API access to the frontend  
- **Frontend → Backend (API)** → Fetches contest & user data via **REST APIs**  

### 📌 **Key Separation Highlights**  
✅ **Crawler is completely independent** – It runs via **Crontab**, not triggered by backend requests  
✅ **No direct connection** between backend and crawler – Only **MongoDB** is shared  
✅ **Fully automated system** – No need for manual execution; everything is handled by **scheduled cron jobs**  

This ensures a **modular, scalable, and efficient system**, where each component runs **independently** and can be upgraded separately without affecting others! 🚀

----



## 🛠 Tech Stack  
- **Frontend:** ⚛️ React.js  
- **Backend:** 🟢 Node.js (Express.js)  
- **Database:** 🛢 MongoDB  
- **APIs Used:**  
  - 📡 **Codeforces API**  
  - 📡 **LeetCode API (graph ql  queries)**  
- **Web Scraping:** 🌐  
  - **Requests + BeautifulSoup** → leetcode and  codechef  Contests  
  - **Selenium** → YouTube Solution Videos  and codechef  contests
- **Authentication:** 🔑 JWT-based login & signup  
- **Automation:** ⏳ Cron Jobs (Crontab)  



## 🚀 How to Run  

### 🐍 **Run the Crawler (Python) – Independent Module**  
The crawler runs separately, fetching contests & YouTube solutions. Just run it, and your database will be filled automatically! ✅  


python3 crawler_main.py 

Or automate it with crontab

🔹 Make sure to install dependencies:
pip install -r requirements.txt  

🔹 Ensure Selenium WebDriver is installed for YouTube scraping.

you can run backend simply by going  into directory  setting up your  mongo  uri  and running  server.js 


## 🎯 Challenges Faced & Solutions  

🔹 **Rate Limits in APIs**: Used caching to avoid excessive requests  
🔹 **Handling Dynamic Content**: Used Selenium for JavaScript-rendered pages  
🔹 **Avoiding IP Blocks**: Implemented proxies & user-agents in scrapers  
🔹 **Efficient Storage**: Used MongoDB for contest history  
🔹 **Automating Everything**: Used Crontab for scheduled execution  

---

## 📢 Future Improvements  

🚀 **Add reminders & notifications** for upcoming contests  
🚀 **Improve frontend UI** for better user experience  
🚀 **Expand to more** competitive programming sites  
🚀 **Optimize YouTube scraping** for better solution accuracy  



