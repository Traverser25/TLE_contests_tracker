const User = require('../model/user_model');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY = "TEST";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone number validation regex (Assuming 10-digit Indian phone numbers)
const phoneRegex = /^[6-9]\d{9}$/;

const signup = async (req, res) => {
    try {
        const { username, email, phoneNumber, password, confirmPassword } = req.body;

        // Check if all fields are provided
        if (!username || !email || !phoneNumber || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Validate phone number format
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ 
            username, 
            email, 
            phoneNumber, 
            password: hashedPassword 
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully", user: { username, email, phoneNumber } });
    } catch (error) {
        res.status(500).json({ message: "Signup failed", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare hashed passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "7d" });

        res.status(200).json({ 
            message: "Login successful", 
            userId: user._id, 
            token 
        });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

module.exports = { login, signup };
