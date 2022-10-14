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
  geographic: geoSchema
});

module.exports = mongoose.model('user', UserSchema);
