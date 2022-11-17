const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { check, validationResult } = require('express-validator');


// @route   POST api/profile/me
// @desc    Get Current User Profile Route
// @access  Priv

// router.post("/me", auth, async (req, res) => {
//   try {
//     const profile = await Profile.findOne({ user: req.user.id }).populate(
//       "user",
//       ["name"]
//     );
//     if (!profile) {
//       return res.status(400).json({ msg: "There is no profile for this user" });
//     }
//     res.json(profile);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });


router.post("/ree", (req, res) => {
  res.send("ree");
});

// @route  POST /profile
// @desc   Create or Update User Profile
// @access Private

router.post(
  "/",
  [
    auth,
    [
      check("tag", "tag is required").not().isEmpty(),
      check("pronoun", "pronoun is required").not().isEmpty(),
      // check("issue", "Skissueills is required").not().isEmpty(),
      check("dob", "dob is required").not().isEmpty(),
      check("zip", "zip is required").not().isEmpty(),
      check("pic", "pic is required").not().isEmpty(),
      // check("cover", "cover is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { tag, dob, zip, pronoun, pic, cover, long, lat } = req.body;


    // Build Profile Object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (tag) profileFields.tag = tag;
    // if (issue) profileFields.issue = issue;
    if (dob) profileFields.dob = dob;
    if (zip) profileFields.zip = zip;
    if (pic) profileFields.pic = pic;
    // if (cover) profileFields.cover = cover;
    if (pronoun) profileFields.pronoun = pronoun;

    // profileFields.long = long;
    // profileFields.lat = lat;

    // profileFields.geographic = {
    //   name: "geonamehere",
    //   location: {
    //     location: {
    //       type: "Point",
    //       coordinates: [
    //         parseInt(long) || 0,
    //         parseInt(lat) || 0,
    //       ]
    //     }
    //   }
    // }

    console.log(profileFields);

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/profile
// @desc    Get all profiles, with their user name and email with all their profile info
// @access  Public

router.get("/all", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name"]);
    
    if (!profile) return res.status(400).json({ msg: "Profile not found" });
    
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

// view a users profile by their auth token
router.get("/view", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name"]);

    if (!profile) return res.status(400).json({ msg: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }

    res.status(500).send("Server Error");
  }
});



// get user by auth token
//  router.get("/user", auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     res.json(user);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });


module.exports = router;

