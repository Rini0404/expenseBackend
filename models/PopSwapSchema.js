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
    audience: {
        type: String,
        required: true
    },
    childSwapIds: 
    {
        type: [String],
        required: true
    }
});

const swapSchema = new mongoose.Schema({
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
    audience: {
        type: String,
        required: true
    },
    childSwapIds: 
    {
        type: [String],
        required: true
    },
    parentSwapId: {
        type: String,
        required: true
    }
}); 

module.exports = { Pop: mongoose.model("pop", popSchema), Swap: mongoose.model("swap", swapSchema) };
