const mongoose = require('mongoose')
const DB_URI = "mongodb://admin:password@mongo.devusol.net/test-users";
//Database connection
mongoose.connect(DB_URI,
{useNewUrlParser: true, useUnifiedTopology: true});
const connection = mongoose.connection
module.exports = connection
