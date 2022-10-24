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
            "-hls_segment_filename",
            `${videoPath}/${req.body.popId}/swaps/${swapUUID}/video%03d.mp4`,
            `${videoPath}/${req.body.popId}/swaps/${swapUUID}/output.m3u8`,
          ])
          .on("end", function () {
            console.log("conversion done");
          }
          )
          .on("error", function (err) {
            console.log("an error happened: " + err.message);
          }
          )
          .save(`${videoPath}/${req.body.popId}/swaps/${swapUUID}/video.m3u8`);

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
  let swapRet = [],
    swapTrack;
  const swapDir = `${videoPath}/${req.query.popId}/swaps`;

  if (!fs.existsSync(swapDir)) {
    return res
      .json({
        popId: req.query.popId,
        swaps: [],
      })
      .end();
  }

  const swapIds = await fs.promises.readdir(swapDir);


  // seperate the swap ids into two arrays
  const swapVids = swapIds.filter((swapId) => swapId.includes(".mp4"));

  // remove the file extension from the swap ids
  swapVids.forEach((swapId, idx) => {
    swapVids[idx] = swapId.replace(".mov.mp4", "");
  });

  res.json({ 
    popId: req.query.popId, 
    swaps: swapVids,
  })
  .end();

});

//   // res.json(swapIds.map(swapId => `swaps/get?popId=${req.query.popId}&swapId=${swapId}`))



new Swap();

router.use("/", express.static(videoPath));

router.get("/get", (req, res) => {
  res.sendFile(`${videoPath}/${req.query.popId}/swaps/${req.query.swapId}.mov`);
});

module.exports = router;
