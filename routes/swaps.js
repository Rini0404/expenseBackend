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

// route to view swap

if (!fs.existsSync(videoPath)) {
  fs.mkdirSync(videoPath);
}

ffmpeg.setFfmpegPath(ffmpegPath);

router.post(
  // create new swap for a pop 
  "/",
  fileUpload({
    createParentPath: true,
  }),
  async function (req, res) {
    console.log(req.files, req.body);
    let uploadSuccess = false;
    let swapUUID = uuid();
    let createdVidPath;
    if (req.files) {
      for (let elmName in req.files) {
        const file = req.files[elmName];
        if (!(file instanceof Array)) {
          createdVidPath = `${videoPath}/${req.body.popId}/swaps/${swapUUID}/video.mov`;
          console.log("creating new swap", swapUUID);
          await file.mv(createdVidPath);
          //temp use local ffmpeg on server to convert to mp4 for playback on android.
          //eventually move this to ffmpeg.wasm implementation using @ffmpeg/ffmpeg module
          ffmpeg(createdVidPath, { timeout: 432000 })
          .addOptions([
            "-profile:v baseline",
            "-level 3.0",
            "-start_number 0",
            "-hls_time 1",
            "-hls_list_size 0",
            "-f hls",
          ])
          .output(`${videoPath}/${req.body.popId}/swaps/${swapUUID}/output.m3u8`)
          .on("end", function () {
            console.log("conversion done");
          }
          )
          .on("error", function (err) {
            console.log("an error happened: " + err.message);
          }
          )
          .run();

          

          // in the Pop model, find the pop with the UUID of 
          // req.body.popId and add the swapUUID to the childSwapIds array 
          const pop = await Pop.findOne({ uuid: req.body.popId });

          pop.childSwapIds.push(swapUUID);
          await pop.save();

          //create swap object
          const swap = new Swap({
            popId: req.body.popId,
            uuid: swapUUID,
            description: req.body.description,
            tags: req.body.tags || "No Tags",
            title: req.body.title || "No Title",
            creator: req.body.creator || "No Creator",
            created: Date.now(),
          })
          await swap.save(); 
          uploadSuccess = true;
        }
      }
    }

    if(!uploadSuccess){
      res.status(500).send("upload failed");
    }

    await extFrms({
      input: createdVidPath,
      output: `${videoPath}/${req.body.popId}/swaps/${swapUUID}/thumb.png`,
      offsets: [1],
    });

    res.json({
      success: uploadSuccess,
      recent_upload: swapUUID,
      parent: req.body.popId,
    })
    .end();

  }

);


router.get("/onPop", async (req, res) => {

  // when we hit this route we are returning the lis of swaps for a given pop
  
  let swapReturn = [];

  const swaps = await Swap.find({ popId: req.query.popId });

  for (let i = 0; i < swaps.length; i++) {
    swapReturn.push({
      uuid: swaps[i].uuid,
      description: swaps[i].description || "No Description",
      tags: swaps[i].tags || "No Tags",
      title: swaps[i].title || "No Title",
      creator: swaps[i].creator || "No Creator",
      created: swaps[i].created || "No Date",
    });
  }

  res.json(swapReturn).end();

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

// get the route to watch a swap 
router.get("/get", async (req, res) => {
  res.sendFile(`${videoPath}/${req.query.popId}/swaps/${req.query.swapId}/video.mov`);
})


router.use("/", express.static(videoPath));


module.exports = router;
