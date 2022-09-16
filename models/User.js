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

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  role:{
    type: String
  },
  postalcode: {
    type: String,
    required: true
  },
  country:{
    type: String
  },
  about: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  geographic: geoSchema
});

module.exports = mongoose.model('user', UserSchema);
