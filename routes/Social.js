const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
 '/', 
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
  ],
  async (req, res) => {
    console.log("THIS IS FROM SOCIAL SIGNUP ROUTE: ", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, loc } = req.body;

    try {
      let user = await User.findOne({ email });

      // if(typeof loc.name != "string" || typeof loc.long != "number" || typeof loc.lat != "number") return;

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        name,
        email,
        pops: []
      });

      await user.save();

      const payload = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      };

      jwt.sign(
        payload,
        config.get('devSecrete'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;