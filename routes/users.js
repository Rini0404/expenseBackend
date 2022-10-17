const express = require("express");
const router = express.Router();
// get user model
const User = require("../models/User");

// @route   POST api/users/register
// @desc    Register new user
// @access  Public
router.post('/', async(req, res) => {
  console.log(req.body);
  //  read data from form we sent
  // now we need to save it to the database mongodb

  const { name, email } = req.body;

  // check if user exists
  try { 
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }
    user = new User({
      name,
      email
    });
    await user.save();

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }

});


// @route   GET api/users/all
// @desc    get all users route
// @access  Public

router.get("/all", async (req, res) => {
 
  // get all lthe users
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }

});


module.exports = router;


// [
//   check("name", "Please enter a name")
//     .not()
//     .isEmpty(),
//   check("email", "Please enter a valid email").isEmail(),
//   check(
//     "password",
//     "Please enter a password with 6 or more characters"
//   ).isLength({ min: 6 })
// ]