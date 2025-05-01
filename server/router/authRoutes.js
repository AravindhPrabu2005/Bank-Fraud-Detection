const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const router = express.Router();

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access denied" });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(400).json({ error: "Invalid token" });
    }
};

router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.json({ message: "User registered" });
});

router.post("/admin/register", async (req, res) => {
    const { name, email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ error: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ name, email, password: hashedPassword });
    await admin.save();
    res.json({ message: "Admin registered successfully" });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user._id, email: user.email, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.json({
            success: true,
            token,
            user: { isAdmin: false, isLoggedIn: true, userId: user._id }
        });
    }

    const admin = await Admin.findOne({ email });
    if (admin && await bcrypt.compare(password, admin.password)) {
        const token = jwt.sign({ id: admin._id, email: admin.email, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.json({
            success: true,
            token,
            user: { isAdmin: true, isLoggedIn: true, userId: admin._id }
        });
    }

    return res.status(401).json({ success: false, error: "Invalid credentials" });
});

router.get("/protected", authMiddleware, (req, res) => {
    res.json({ message: "Protected data", user: req.user });
});

module.exports = router;
