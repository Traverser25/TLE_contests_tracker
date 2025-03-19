const mongoose = require("mongoose");

const getUpcomingAndBeforeContests = async (req, res) => {
    try {
        const db = mongoose.connection.db; // Use the existing DB connection
        const collection = db.collection("crawled_contests"); // Use correct collection name

        // Fetch all contests to count total
        const totalContests = await collection.countDocuments();

        // Fetch only "UPCOMING" & "BEFORE" contests
        const upcomingBeforeContests = await collection.find({ status: { $in: ["UPCOMING", "BEFORE"] } }).toArray();
        const liveContests = upcomingBeforeContests.length; // Renamed to liveContests

        res.status(200).json({
            success: true,
            metadata: {
                totalContests, // Total contests in DB
                liveContests   // Count of "UPCOMING" & "BEFORE" contests
            },
            contests: upcomingBeforeContests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            metadata: { totalContests: 0, liveContests: 0 },
            message: "Failed to fetch contests",
            error: error.message
        });
    }
};

const getOtherContests = async (req, res) => {
    try {
        const db = mongoose.connection.db; // Use existing DB connection
        const collection = db.collection("crawled_contests");

        // Exclude contests with status "UPCOMING" or "BEFORE"
        const contests = await collection.find({ status: { $nin: ["UPCOMING", "BEFORE"] } }).toArray();
        const totalContests = await collection.countDocuments();
        const liveContests =totalContests- contests.length;

        res.status(200).json({
            success: true,
            metadata: {
                totalContests,
                liveContests
            },
            contests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            metadata: { totalContests: 0, liveContests: 0 },
            message: "Failed to fetch contests",
            error: error.message
        });
    }
};

module.exports = { getUpcomingAndBeforeContests, getOtherContests };
