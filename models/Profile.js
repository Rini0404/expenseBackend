
const mongoose = require('mongoose');

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
  // pic: { 
  //   type: String
  // },
  // cover : { 
  //   type: String
  // },
});

module.exports = mongoose.model('profile', ProfileSchema);
