"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBookmark as faBookmarkSolid,
  faUsers,
  faTrophy,
  faBell,
  faFilter,
  faXmark,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons"
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons"
import { faYoutube } from "@fortawesome/free-brands-svg-icons"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../css/contestant-dashboard.css"

const ContestantDashboardPage = () => {
  const [contests, setContests] = useState([])
  const [bookmarkedContests, setBookmarkedContests] = useState([])
  const [metadata, setMetadata] = useState({ totalContests: 0, liveContests: 0 })
  const [platformFilters, setPlatformFilters] = useState([])
  const [showOldContests, setShowOldContests] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [contestsPerPage] = useState(5) // Fixed number of contests per page
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("auth_code"))

  // Platforms data
  const platforms = [
    { id: "CF1", name: "Codeforces", color: "#1e88e5" },
    { id: "CC3", name: "CodeChef", color: "#43a047" },
    { id: "LC2", name: "LeetCode", color: "#fb8c00" },
    { id: "HR4", name: "HackerRank", color: "#8e24aa" },
    { id: "AT5", name: "AtCoder", color: "#d81b60" },
  ]

  useEffect(() => {
    fetchLiveContests(); // Fetch live contests by default
    fetchBookmarks();
    fetchNotifications();
  }, [])

  const fetchLiveContests = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/live_contest")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setContests(
          data.contests.map((contest) => ({
            ...contest,
            isBookmarked: false,
          })),
        );
        setMetadata(data.metadata);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching live contests:", error);
        toast.error("Failed to load live contests. Please try again later.");
        setLoading(false);
      });
  };

  const fetchPastContests = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/past_contest")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setContests(
          data.contests.map((contest) => ({
            ...contest,
            isBookmarked: false,
          })),
        );
        setMetadata(data.metadata);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching past contests:", error);
        toast.error("Failed to load past contests. Please try again later.");
        setLoading(false);
      });
  };

  const fetchBookmarks = () => {
    const token = localStorage.getItem("auth_code");

    if (!token) {
        toast.error("You need to log in to access bookmarks.");
        return;
    }

    fetch("http://localhost:5000/get_bookmarks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            console.log("API Response:", data); // Log the response

            // Update the state with the bookmarked contests
            setBookmarkedContests(data.bookmarkedContests || []);

            // Update isBookmarked property for contests
            setContests((prevContests) =>
                prevContests.map((contest) => ({
                    ...contest,
                    isBookmarked: (data.bookmarkedContests || []).some(
                        (bookmark) => bookmark.contest_id === contest.contest_id
                    ),
                }))
            );
        })
        .catch((error) => {
            console.error("Error fetching bookmarks:", error);
            toast.error("Failed to load bookmarks. Please try again later.");
        });
  };

  const fetchNotifications = () => {
    // Mock notifications - replace with actual API call
    const mockNotifications = [
      { id: 1, message: "New Codeforces contest tomorrow", date: "2023-05-15", read: false },
      { id: 2, message: "LeetCode weekly contest starts in 2 hours", date: "2023-05-14", read: true },
      { id: 3, message: "Your bookmark list was updated", date: "2023-05-13", read: false },
    ];
    setNotifications(mockNotifications);
  };

  const toggleBookmark = (contestId) => {
    const contest = contests.find((c) => c.contest_id === contestId);
    const isCurrentlyBookmarked = contest.isBookmarked;

    // Optimistic UI update
    setContests((prevContests) =>
      prevContests.map((c) => (c.contest_id === contestId ? { ...c, isBookmarked: !c.isBookmarked } : c)),
    );

    fetch(`http://localhost:5000/bookmark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("auth_code")}`,
      },
      body: JSON.stringify({ contestId }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        toast.success(data.message || (isCurrentlyBookmarked ? "Bookmark removed" : "Contest bookmarked"));
    
        // Update bookmarks list if showing bookmarks
        if (isCurrentlyBookmarked) {
          setBookmarkedContests((prev) => prev.filter((b) => b.contest_id !== contestId));
        } else {
          fetchBookmarks(); // Refresh bookmarks to get updated list
        }
      })
      .catch((error) => {
        console.error("Error toggling bookmark:", error);
        toast.error("Failed to update bookmark. Please try again.");
    
        // Revert the optimistic update
        setContests((prevContests) =>
          prevContests.map((c) =>
            c.contest_id === contestId ? { ...c, isBookmarked: isCurrentlyBookmarked } : c,
          ),
        );
      });
  };

  const handlePlatformFilterChange = (platformId) => {
    setPlatformFilters((prev) => {
      if (prev.includes(platformId)) {
        return prev.filter((p) => p !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  const currentDate = new Date();

  const filteredContests = contests.filter((contest) => {
    const matchesPlatform = platformFilters.length === 0 || platformFilters.includes(contest.platform_id);
    const isOldContest = new Date(contest.date) < currentDate;
    return matchesPlatform && (showOldContests || !isOldContest);
  });

  const calculateTimeLeft = (contestDate) => {
    const date = new Date(contestDate);
    const diff = date - currentDate;

    if (diff < 0) {
      return { text: "Contest ended", isUrgent: false };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const isUrgent = days < 2;
    return {
      text: `${days}d ${hours}h ${minutes}m`,
      isUrgent,
    };
  };

  const getPlatformColor = (platformId) => {
    const platform = platforms.find((p) => p.id === platformId);
    return platform ? platform.color : "#666";
  };

  const getPlatformName = (platformId) => {
    const platform = platforms.find((p) => p.id === platformId);
    return platform ? platform.name : platformId;
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    );
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Calculate pagination
  const indexOfLastContest = currentPage * contestsPerPage;
  const indexOfFirstContest = indexOfLastContest - contestsPerPage;
  const currentContests = filteredContests.slice(indexOfFirstContest, indexOfLastContest);
  const totalPages = Math.ceil(filteredContests.length / contestsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If total pages are less than or equal to maxPagesToShow, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 3) {
        endPage = Math.min(maxPagesToShow - 1, totalPages - 1);
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (maxPagesToShow - 2));
      }
      
      // Add ellipsis if needed at the beginning
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed at the end
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_code");
    setIsAuthenticated(false);
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <header className="dashboard-header">
        <h1 className="dashboard-heading">Contestant Dashboard</h1>

        <div className="header-actions">
          <div className="notification-wrapper">
            <button
              className="notification-button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <FontAwesomeIcon icon={faBell} />
              {unreadNotificationsCount > 0 && <span className="notification-badge">{unreadNotificationsCount}</span>}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="close-button">
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="no-notifications">No notifications</p>
                ) : (
                  <ul className="notification-list">
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`notification-item ${notification.read ? "read" : "unread"}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-date">{notification.date}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button className="bookmarks-button" onClick={() => setShowBookmarks(!showBookmarks)} aria-label="Bookmarks">
            <FontAwesomeIcon icon={faBookmarkSolid} />
            <span>Bookmarks</span>
          </button>

          {isAuthenticated ? (
            <button className="logout-button" onClick={handleLogout} aria-label="Logout">
              <FontAwesomeIcon icon={faUsers} />
              <span>Logout</span>
            </button>
          ) : (
            <button className="login-button" aria-label="Login/Signup">
              <a href="/login" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FontAwesomeIcon icon={faUsers} />
                <span>Login/Signup</span>
              </a>
            </button>
          )}
        </div>
      </header>

      {showBookmarks && (
        <div className="bookmarks-modal">
          <div className="bookmarks-content">
            <div className="bookmarks-header">
              <h2>Your Bookmarked Contests</h2>
              <button onClick={() => setShowBookmarks(false)} className="close-button">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {bookmarkedContests.length === 0 ? (
              <p className="no-bookmarks">You haven't bookmarked any contests yet.</p>
            ) : (
              <div className="bookmarks-list">
                {bookmarkedContests.map((bookmark) => (
                  <div key={bookmark.contest_id} className="bookmark-card">
                    <div className="bookmark-info">
                      <h3>{bookmark.name}</h3>
                      <div className="bookmark-details">
                        <span
                          className="platform-badge"
                          style={{ backgroundColor: getPlatformColor(bookmark.platform_id) }}
                        >
                          {getPlatformName(bookmark.platform_id)}
                        </span>
                        <span className="bookmark-date">{new Date(bookmark.date).toLocaleDateString()}</span>
                      </div>
                      <p className="bookmark-time-left">
                        {calculateTimeLeft(bookmark.date).text}
                        {calculateTimeLeft(bookmark.date).isUrgent && <span className="urgent-indicator"></span>}
                      </p>
                    </div>
                    <div className="bookmark-actions">
                      <button onClick={() => toggleBookmark(bookmark.contest_id)} className="remove-bookmark-button">
                        <FontAwesomeIcon icon={faBookmarkSolid} />
                        <span>Remove</span>
                      </button>
                      <a
                        href={bookmark.contest_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contest-link-button"
                      >
                        Visit
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="stats-cards">
        <div className="stats-card">
          <div className="stats-item">
            <FontAwesomeIcon icon={faUsers} className="stats-icon" />
            <div className="stats-details">
              <span className="stats-value">{metadata.totalContests}</span>
              <span className="stats-label">Total Contests</span>
            </div>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-item">
            <FontAwesomeIcon icon={faTrophy} className="stats-icon" />
            <div className="stats-details">
              <span className="stats-value">{metadata.liveContests}</span>
              <span className="stats-label">Active Contests</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container">
        <div className="filter-section">
          <div className="filter-header">
            <h2>
              <FontAwesomeIcon icon={faFilter} /> Filters
            </h2>
          </div>

          <div className="platform-filters">
            <h3>Platforms</h3>
            <div className="platform-checkboxes">
              {platforms.map((platform) => (
                <label key={platform.id} className="platform-checkbox">
                  <input
                    type="checkbox"
                    checked={platformFilters.includes(platform.id)}
                    onChange={() => handlePlatformFilterChange(platform.id)}
                  />
                  <span className="platform-name" style={{ color: platform.color }}>
                    {platform.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="additional-filters">
            <label className="old-contests-filter">
              <input
                type="checkbox"
                checked={showOldContests}
                onChange={() => {
                  setShowOldContests(!showOldContests);
                  if (!showOldContests) {
                    fetchPastContests(); // Fetch past contests when checked
                  } else {
                    fetchLiveContests(); // Fetch live contests when unchecked
                  }
                }}
              />
              <span>Show Past Contests</span>
            </label>
          </div>
        </div>

        <div className="table-section">
          <h2>{showOldContests ? "Past Contests" : "Upcoming & Live Contests"}</h2>

          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : filteredContests.length === 0 ? (
            <div className="no-contests">
              <p>No contests match your current filters.</p>
            </div>
          ) : (
            <div className="responsive-table-container">
              <table className="contests-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className="hide-mobile">Platform</th>
                    <th className="hide-mobile">Start Date</th>
                    <th className="hide-tablet">Duration</th>
                    <th>Time Left</th>
                    <th>Bookmark</th>
                    <th>Solution</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {currentContests.map((contest) => {
                    const timeLeft = calculateTimeLeft(contest.date);
                    return (
                      <tr key={contest.contest_id}>
                        <td className="contest-name">{contest.name}</td>
                        <td className="platform-cell hide-mobile">
                          <span
                            className="platform-badge"
                            style={{ backgroundColor: getPlatformColor(contest.platform_id) }}
                          >
                            {getPlatformName(contest.platform_id)}
                          </span>
                        </td>
                        <td className="hide-mobile">{new Date(contest.date).toLocaleDateString()}</td>
                        <td className="hide-tablet">{contest.duration}</td>
                        <td className="time-left">
                          {timeLeft.isUrgent && <span className="urgent-indicator"></span>}
                          {timeLeft.text}
                        </td>
                        <td className="actions-cell">
                          <button
                            onClick={() => toggleBookmark(contest.contest_id)}
                            className={`bookmark-button ${contest.isBookmarked ? "bookmarked" : ""}`}
                            aria-label={contest.isBookmarked ? "Remove bookmark" : "Add bookmark"}
                          >
                            <FontAwesomeIcon
                              icon={contest.isBookmarked ? faBookmarkSolid : faBookmarkRegular}
                              className="bookmark-icon"
                            />
                          </button>
                        </td>
                        <td className="actions-cell">
                          {contest.solution_link ? (
                            <a
                              href={contest.solution_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="solution-link"
                              aria-label="View solution"
                            >
                              <FontAwesomeIcon icon={faYoutube} className="youtube-icon" />
                            </a>
                          ) : (
                            <span className="coming-soon">Coming Soon</span>
                          )}
                        </td>
                        <td className="actions-cell">
                          <a
                            href={contest.contest_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contest-link"
                            aria-label="Go to contest"
                          >
                            Visit
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {filteredContests.length > 0 && (
                <div className="pagination">
                  <button 
                    onClick={prevPage} 
                    className="pagination-button"
                    disabled={currentPage === 1}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    <span>Previous</span>
                  </button>
                  
                  <div className="pagination-numbers">
                    {getPageNumbers().map((number, index) => (
                      number === '...' ? (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                      ) : (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                        >
                          {number}
                        </button>
                      )
                    ))}
                  </div>
                  
                  <button 
                    onClick={nextPage} 
                    className="pagination-button"
                    disabled={currentPage === totalPages}
                  >
                    <span>Next</span>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestantDashboardPage;
