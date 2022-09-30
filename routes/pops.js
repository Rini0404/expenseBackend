const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const { getPops } = require("../utils/fsHandlers");
const videoPath = "./assets/pops";
const uuid = require("uuid-random");
const extFrms = require("ffmpeg-extract-frames");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const { exec } = require("node:child_process");
// const multer = require("multer");
// const upload = multer({ dest: 'uploads/' })
// @route    POST /pops
// @desc     Save uploads to assets/pops/[uuid].mov
// @access   Public
router.post(
  "/",
  fileUpload({
    createParentPath: true,
  }),
  async function (req, res) {
    console.log(req.files, req.body);
    //TODO: req.body should have as much data as possible from the sending app and attach it to the uuid object
    //this data will be used to find filter and sort the pops later

    let uploadSuccess = false;
    const popUUID = uuid();
    var createdVidPath;
    if (req.files) {
      //TODO: if the file type is not  mimetype: 'video/quicktime', forceMOV();

      for (let elmName in req.files) {
        const file = req.files[elmName];
        if (!(file instanceof Array)) {
          createdVidPath = `${videoPath}/${popUUID}/video.mov`;
          console.log("creating new pop", popUUID);
          await file.mv(createdVidPath);

          //temp use local ffmpeg on server to convert to mp4 for playback on android.
          //eventually move this to ffmpeg.wasm implementation using @ffmpeg/ffmpeg module
          await exec(
            `ffmpeg -i ${videoPath}/${popUUID}/video.mov -vcodec h264 -vf scale=432:-1 -acodec copy ${videoPath}/${popUUID}/video.mp4`
          );

          uploadSuccess = true;
          break;
        }
      }
    }

    if (!uploadSuccess) {
      res.json({ success: uploadSuccess }).end();
      return;
    }

    await extFrms({
      input: createdVidPath,
      output: `${videoPath}/${popUUID}/thumb.jpg`,
      offsets: [0],
      ffmpegPath,
    });

    res
      .json({
        success: uploadSuccess,
        recent_upload: popUUID,
        thumb: `pops/${popUUID}/thumb.jpg`,
        pops: (await getPops()).map((vidName) => `pops/${vidName}`),
      })
      .end();

    // res.json({ success: uploadSuccess, recent_upload: `pops/${popUUID}/video.mov`, thumb: `pops/${popUUID}/thumb.jpg`, pops: (await getPops()).map(vidName => `pops/${vidName}`) }).end();
  }
);

router.get("/all", async (req, res) => {
  res.json({ pops: await getPops() }).end();
});

router.get("/me", async (req, res) => {
  res.json({ pops: await getPops() }).end();
});

// router.get("/", (req, res) => {
//     console.log(req.url);
//     res.sendFile(`${videoPath}/`)
// });

router.use("/", express.static(videoPath));

router.get("/get", (req, res) => {
  res.sendFile(`${videoPath}/${req.query.popId}/video.mov`);
});

router.get("/childSwaps", (req, res) => {
  res.redirect(`/swaps/onPop?popId=${req.query.popId}`);
});

module.exports = router;

async function forceMOV() {
  //maybe use bash and ffmpeg to convert files
  //https://nodesource.com/blog/how-to-run-shell-and-more-using-Nodejs
}
