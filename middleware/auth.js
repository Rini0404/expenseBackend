const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get("devSecrete"));

    req.user = decoded.user;

    const dbUser = await User.findById(req.user.id);
    if(!dbUser) {
      res.json({error: true, reason: "Invalid user"});
      return;
    }

    if(!dbUser.pops) {
      dbUser.pops = [];
      await dbUser.save();
    }

    req.DBUser = dbUser;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }

  
};