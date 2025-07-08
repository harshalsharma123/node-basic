const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/response");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return sendResponse(res, 404, "No token has provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "your_secret_key");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
