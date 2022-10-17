const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const User = require("../models/User");


// @route   POST api/profile/
// @desc    Create profile
// @access  Private

  router.get( "/", async (req, res) => {
    res.send("Profile route");
  })


module.exports = router;