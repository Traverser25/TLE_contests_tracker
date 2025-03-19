const express = require("express");
const user_router = express.Router();
const { signup } = require('../controller/signup_controller')
const { login }=require('../controller/signup_controller')

const { bookmarkContest } = require("../controller/bookmark_controller");
const { getBookmarkedContests } = require("../controller/bookmark_controller");
const authMiddleware = require("../middlewares/authMiddleware");


user_router.post("/signup", signup);
user_router.post("/login", login);
user_router.post("/bookmark", authMiddleware, bookmarkContest);
user_router.post("/get_bookmarks", authMiddleware, getBookmarkedContests);

module.exports = user_router;
