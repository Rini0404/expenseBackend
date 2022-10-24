const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const { getPops, convertPopSwap } = require("../utils/popswapsutil");
const videoPath = "./assets/pops";
const uuid = require("uuid-random");
const extFrms = require("ffmpeg-extract-frames");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
//const { exec } = require("node:child_process");
const { Pop } = require("../models/PopSwapSchema");
const fs = require("fs");
// const multer = require("multer");
// const upload = multer({ dest: 'uploads/' })
// @route    POST /pops
// @desc     Save uploads to assets/pops/[uuid].mov
// @access   Public

ffmpeg.setFfmpegPath(ffmpegPath);

if (!fs.existsSync(videoPath)) {
  fs.mkdirSync(videoPath);
}

// router.get("/", (req, res) => {

// });


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
          ffmpeg(createdVidPath, {timeout: 432000 })
          .addOptions([
            "-profile:v baseline",
            "-level 3.0",
            "-start_number 0",
            "-hls_time 1",
            "-hls_list_size 0",
            "-f hls"
          ])
          .output(`${videoPath}/${popUUID}/output.m3u8`)
          .on("end", () => {
            console.log("ended");
          })
          .run();
          // await exec(
          //   `${ffmpegPath} -i ${videoPath}/${popUUID}/video.mov -vcodec h264 -vf scale=448:-1 -acodec copy ${videoPath}/${popUUID}/video.mp4`
          // );

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

    /*
       uuid: popUUID,
      desc: req.body.description,
      topic: req.body.topic,
      creator: req.body.creator,
      audience: req.body.audience
 */

    const pop = new Pop({
      uuid: popUUID,
      description: req.body.description,
      topic: req.body.topic,
      creator: req.body.creator || "no user",
      audience: req.body.audience,
      childSwapIds: []
    });

    try {
      pop.save();
    } catch(e) {
      console.log("error saving pop...\n\n\n",e);
      fs.unlinkSync(`${videoPath}/${popUUID}`);
    }

    

    res
      .json({
        success: uploadSuccess,
        recent_upload: popUUID,
        thumb: `pops/${popUUID}/thumb.jpg`,
        pops: convertPopSwap(await getPops()),
      })
      .end();

    // res.json({ success: uploadSuccess, recent_upload: `pops/${popUUID}/video.mov`, thumb: `pops/${popUUID}/thumb.jpg`, pops: (await getPops()).map(vidName => `pops/${vidName}`) }).end();
  }
);

// router.get(/.*\/video\.(mov|mp4)\/?$/, (req, res) => {
  
// });

router.get("/all", async (req, res) => {
  const pops = await getPops();
  return res.json(convertPopSwap(pops));
});


registerSearch("creator", "topic", "audience", "uuid");

function registerSearch(...names) {
  for(const name of names) {
    router.get("/search", async (req, res, next) => {
      if(!req.query[name]) {
        next();
        return;
      }
      const pops = await Pop.find({
        [name]: req.query[name]
      });
      res.json(convertPopSwap(pops));
    });
  }
}

router.get("/get", (req, res) => {
  res.sendFile(`${__dirname.split("routes")[0]}/assets/pops/${req.query.popId}/video.mov`);
});

router.get("/data", async (req, res) => {
  const pop = await Pop.findOne({
    uuid: req.query.popId
  });
  if(pop.length) {
    res.json(convertPopSwap(pop));
  } else {
    res.status(500).json(
    {
      error: true,
      reason: "no video with id " + req.query.popId
    })
  }
});

router.get("/childSwaps", (req, res) => {
  res.redirect(`/swaps/onPop?popId=${req.query.popId}`);
});

module.exports = router;

async function forceMOV() {
  //maybe use bash and ffmpeg to convert files
  //https://nodesource.com/blog/how-to-run-shell-and-more-using-Nodejs
}
