const express = require('express')
const router = express.Router()
const fileUpload = require("express-fileupload");
const { getPops } = require("../utils/fsHandlers");
const videoPath = "./assets/pops";
const uuid = require('uuid-random');



module.exports = router