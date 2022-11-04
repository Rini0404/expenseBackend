const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const videoPath = "./assets/pops";
const uuid = require("uuid-random");
const fs = require("fs");
const extFrms = require("ffmpeg-extract-frames");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// const { Swap } = require("../utils/popswap");
const { exec } = require("node:child_process");

// swaps
const { Swap } = require("../models/PopSwapSchema");
// const { getPops } = require("../utils/popswapsutil");
const { Pop } = require("../models/PopSwapSchema");

// route to view swaps
// if (!fs.existsSync(videoPath)) {
//   fs.mkdirSync(videoPath);
// }

ffmpeg.setFfmpegPath(ffmpegPath);

router.post(
  // create new swap for a pop 
  "/",
  async function (req, res) {
    console.log(req.files, req.body);
    let uploadSuccess = false;
    
        if(req.body){

          // in the Pop model, find the pop with the UUID of 
          // req.body.popId and add the swapUUID to the childSwapIds array 
          const pop = await Pop.findOne({ uuid: req.body.popId });
          
          pop.childSwapIds.push(req.body.uuid);
          await pop.save();
          
          //create swap object
          const swap = new Swap({
            popId: req.body.popId,
            uuid: req.body.uuid,
            description: req.body.description,
            tags: req.body.tags || "No Tags",
            title: req.body.title || "No Title",
            creator: req.body.creator || "No Creator",
            parentSwapId: req.body.popId
          })
          await swap.save(); 
          uploadSuccess = true;
          
        }
          
          
    res.json({
      success: true,
      parent: req.body.popId,
    })
    .end();

  }

);


router.get("/onPop", async (req, res) => {

//  get all the swaps who have the parentSwapId of the popId passed in the query
  const swaps = await Swap.find({ parentSwapId: req.query.popId });
  res.json(swaps);
  

});

new Swap();

// @route   GET api/swaps
// @desc    Route to view a swap by uuid
// @access  Public
router.get("/:uuid", async (req, res) => {
  const swap = await Swap.findOne({ uuid: req.params.uuid });
  if (!swap) {
    return res.status(404).json({ msg: "Swap not found" });
  }
  res.json(swap);

})

// // get the route to watch a swap 
// router.get("/get", async (req, res) => {
//   // play the swap with the uuid passed in the query
//   console.log("IM HERE ")
//   res.sendFile(`${videoPath}/${req.query.popId}/swaps/${req.query.swapId}/output.m3u8`);
// })


router.use("/", express.static(videoPath));


module.exports = router;
