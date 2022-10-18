const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const User = require("../models/User");
const auth = require("../middleware/auth");

// @route   POST api/profile/
// @desc    Create profile
// @access  Private

router.post("/", async (req, res) => {
  // find user by id 
});

// @route   POST api/profile/me
// @desc    Get current users profile
// @access  Private

router.get("/me", async (req, res) => {
  // try {
  //   const profile = await Profile.findOne({ user: req.user.id }).populate(
  //     "user",
  //     ["name", "email"]
  //   );
  //   if (!profile) {
  //     return res.status(400).json({ msg: "There is no profile for this user" });
  //   }
  //   res.json(profile);
  // } catch (err) {
  //   console.error(err.message);
  //   res.status(500).send("Server Error");
  // }
});

module.exports = router;
