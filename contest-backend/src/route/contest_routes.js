const express = require("express");
const { getUpcomingAndBeforeContests } = require("../controller/contest_controller");
const { getOtherContests } = require("../controller/contest_controller");

const contestRouter = express.Router();

// Route to get contests with status "UPCOMING" and "BEFORE"
contestRouter.get("/live_contest", getUpcomingAndBeforeContests);
contestRouter.get("/past_contest", getOtherContests);


module.exports = contestRouter;
