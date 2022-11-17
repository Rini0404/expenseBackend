const mongoose = require('mongoose');

/*
       uuid: popUUID,
      desc: req.body.description,
      topic: req.body.topic,
      creator: req.body.creator,
      audience: req.body.audience
 */

const popSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    creatorPic: {
        type: String,
        required: true
    },
    audience: {
        type: String,
        required: true
    },
    childSwapIds: 
    {
        type: [String],
        required: true
    },
    ratingNum: {
        type: Number
    },
    ratingDen: {
        type: Number
    },
    // String array of unique identifiers to users to check if a user already rated the video
    // Check models/UserRating for alternative method that can increase performance.
    rated: {
        type: [String],
        required: true
    }
});

const swapSchema = new mongoose.Schema({
    // adding error handlers for when required later on. -Rini
    uuid: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        // required: true
    },
    creator: {
        type: String,
        // required: true
    },
    audience: {
        type: String,
        // required: true
    },
    childSwapIds: 
    {
        type: [String],
        // required: true
    },
    parentSwapId: {
        type: String,
        // required: true
    },
    ratingNum: {
        type: Number
    },
    ratingDen: {
        type: Number
    },
    creatorPic: {
        type: String,
        required: true
    },
}); 

// @Rini\*
// Adding ChildSwap Schema 

const childSwapSchema = new mongoose.Schema({
    uuid : {
        type: String,
        required: true
    },
    parentSwapId : {
        type: String, 
        required: true
    },
    creator : {
        type: String,
        required: true
    },
    creatorPic: {
        type: String,
        required: true
    },
});

module.exports = { Pop: mongoose.model("pop", popSchema), Swap: mongoose.model("swap", swapSchema), ChildSwap : mongoose.model("ChildSwap", childSwapSchema ) };
