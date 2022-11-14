const mongoose = require("mongoose");

const userRatingSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true
    },
    ratings: {
        type: [String],
        required: true
    }
});

module.exports = {UserRating: mongoose.model("userrating", userRatingSchema)};