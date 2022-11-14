
const mongoose = require('mongoose');

const geoSchema = new mongoose.Schema({
  name: String,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      // required: true,
    },
    coordinates: {
      type: [Number],
      // required: true,
      index: {
        type: '2dsphere',
        sparse: true
      },
    },
  },
});

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  pronoun: {
    type: String
  },
  tag: {
    type: String,
  },
  dob: {
    type: String
  },
  zip: {
    type: String
  },
  geographic: geoSchema,
  // pic: { 
  //   type: String
  // },
  // cover : { 
  //   type: String
  // },
});

module.exports = mongoose.model('profile', ProfileSchema);
