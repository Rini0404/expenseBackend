const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const { getPops } = require("../utils/fsHandlers");
const videoPath = "./assets/pops";
const uuid = require("uuid-random");
const fs = require("fs");
const extFrms = require("ffmpeg-extract-frames");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const { Swap } = require("../utils/popswap");
const { exec } = require("node:child_process");

if (!fs.existsSync(videoPath)) {
  fs.mkdirSync(videoPath);
}

router.post(
  "/",
  fileUpload({ createParentPath: true }),
  async function (req, res) {
    console.log(req.files, req.body);
    //TODO: req.body should have as much data as possible from the sending app and attach it to the uuid object
    //this data will be used to find filter and sort the pops later

    let uploadSuccess = false;
    const swapUUID = uuid();
    var createdVidPath;
    if (req.files) {
      //TODO: if the file type is not  mimetype: 'video/quicktime', forceMOV();

      for (let elmName in req.files) {
        const file = req.files[elmName];
        if (!(file instanceof Array)) {
          createdVidPath = `${videoPath}/${req.body.popId}/swaps/${swapUUID}.mov`;
          // console.log(createdVidPath);
          await file.mv(createdVidPath);

          //temp use local ffmpeg on server to convert to mp4 for playback on android.
          //eventually move this to ffmpeg.wasm implementation using @ffmpeg/ffmpeg module
          exec(
            `ffmpeg -i ${createdVidPath} -vcodec h264 -vf scale=432:-1 -acodec copy ${createdVidPath}.mp4`
          )

          uploadSuccess = true;
          break;
        }
      }
    }

    if (!uploadSuccess) {
      res.json({ success: uploadSuccess }).end();
    }

    await extFrms({
      input: createdVidPath,
      output: `${videoPath}/${req.body.popId}/swaps/${swapUUID}.jpg`,
      offsets: [0],
      ffmpegPath,
    });

    // res.json({ success: uploadSuccess, recent_upload: `${popUUID}/video.mov`, pops: (await getPops()).map(vidName => `pops/${vidName}`) }).end();
    // res.json({success: uploadSuccess, recent_upload: `${swapUUID}/video.mov`, parent: `pops/${req.query.popId}/video.mov`})
    res
      .json({
        success: uploadSuccess,
        recent_upload: swapUUID,
        parent: req.query.popId,
      })
      .end();
  }
);

router.get("/onPop", async (req, res) => {
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
  res.json({
    popId: req.query.popId,
    swaps: swapIds,
  });
  // res.json(swapIds.map(swapId => `swaps/get?popId=${req.query.popId}&swapId=${swapId}`))
});

new Swap();

router.use("/", express.static(videoPath));

router.get("/get", (req, res) => {
  res.sendFile(`${videoPath}/${req.query.popId}/swaps/${req.query.swapId}.mov`);
});

module.exports = router;
