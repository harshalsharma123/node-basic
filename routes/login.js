const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const { sendResponse } = require("../utils/response");
const bcrypt = require("bcryptjs");

router.post("/", async (req, res) => {
  const { email, first_name, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 1. Find user by email
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = users[0];

    if (!user) {
      return sendResponse(res, 400, "Invalid email");
    }

    // 2. Match first_name
    // const isMatch = user.first_name.toLowerCase() === first_name.toLowerCase();

    // if (!isMatch) {
    //   return sendResponse(res, 400, "Invalid name or email");
    // }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendResponse(res, 400, "Invalid Password");
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      "your_secret_key", // secure in .env
      { expiresIn: "1h" }
    );

    return sendResponse(res, 200, "Login successfully", token);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
