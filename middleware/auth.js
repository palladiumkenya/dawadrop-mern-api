const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const config = require("config");
const User = require("../auth/models/User");

const auth = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ detail: "Access Denied.No token Provided" });
  try {
    const decoded = jwt.verify(token, config.get("jwt"));
    const userId = decoded._id;
    const user = await User.findOne({ _id: userId })
      .select("-password")
      .populate("roles")
    if (!user) return res.status(400).json({ detail: "Invalid Token" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ detail: "Invalid token" });
  }
};

module.exports = auth;
