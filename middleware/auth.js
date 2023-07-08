const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const config = require("config");

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ detail: "Access Denied.No token Provided" });
  try {
    const decoded = jwt.verify(token, config.get("jwt"));
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ detail: "Invalid token" });
  }
};

module.exports = auth;
