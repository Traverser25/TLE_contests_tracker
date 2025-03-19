const User = require('../model/user_model');
const mongoose = require("mongoose");

const bookmarkContest = async (req, res) => {
    try {
        const { contestId } = req.body;
        const userId = req.user.userId;

        if (!contestId) {
            return res.status(400).json({ success: false, message: "Contest ID is required" });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the contest ID already exists in bookmarks
        const isBookmarked = user.bookmarkedContests.includes(contestId);

        if (isBookmarked) {
            // Remove contest from bookmarks
            await User.findByIdAndUpdate(userId, { $pull: { bookmarkedContests: contestId } });
            return res.status(200).json({ success: true, message: "Removed from bookmark" });
        } else {
            // Add contest to bookmarks
            await User.findByIdAndUpdate(userId, { $addToSet: { bookmarkedContests: contestId } });
            return res.status(200).json({ success: true, message: "Added to bookmark" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update bookmark", error: error.message });
    }
};


const getBookmarkedContests = async (req, res) => {
    try {
        const userId = req.user.userId;
        const db = mongoose.connection.db;
        const usersCollection = db.collection("users");
        const contestsCollection = db.collection("crawled_contests");

        // Find user
        const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        if (!user || !user.bookmarkedContests || user.bookmarkedContests.length === 0) {
            return res.status(404).json({ success: false, message: "No bookmarked contests found" });
        }

        // Fetch contests based on `contestId` field
        const bookmarkedContests = await contestsCollection.find({
            contest_id: { $in: user.bookmarkedContests }  // Matching contestId (not _id)
        }).toArray();

        res.status(200).json({
            success: true,
            bookmarkedContests
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch bookmarked contests", error: error.message });
    }
}

module.exports = { bookmarkContest, getBookmarkedContests };

