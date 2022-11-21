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
const auth = require("../middleware/auth");
const User = require("../models/User");
const Profile = require("../models/Profile");
// const multer = require("multer");
// const upload = multer({ dest: 'uploads/' })
// @route    POST /pops
// @desc     Save uploads to assets/pops/[uuid].mov
// @access   Public

// ffmpeg.setFfmpegPath(ffmpegPath);


// if (!fs.existsSync(videoPath)) {
//   fs.mkdirSync(videoPath);
// }
// router.get("/", (req, res) => {

// });


router.post(
  "/",
  async function (req, res) {
    console.log( req.body);
    // let uploadSuccess = false;

    if(req.body){
      // upload to mongo
      const pop = new Pop({
        creator: req.body.creator,
        topic: req.body.topic,
        audience: req.body.audience,
        creatorId: req.body.creatorId,
        uuid: req.body.uuid,
        topic: req.body.topic,
        description: req.body.description,
        creatorPic: req.body.creatorPic,
        childSwapIds: [],
      });
      await pop.save();

      // find the users profile and add the pop to their profile
      const profile = await Profile.findOne({ user: req.body.creatorId });

      console.log("profile", profile );

      profile.myPops.push(pop.uuid)
      
      await profile.save();

     
      
    } else {
      res.status(500).json({
        message: "Error: no data sent",
      });
    }
    res.json({
      success: true,
    });

    

  }
);

router.get("/all", async (req, res) => {
  const pops = await getPops();
  return res.json(convertPopSwap(pops));
});


registerSearch("creator", "topic", "audience", "uuid");

function registerSearch(...names) {
  for (const name of names) {
    router.get("/search", async (req, res, next) => {
      if (!req.query[name]) {
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

// router.get("/get", (req, res) => {
//   res.sendFile(`${__dirname.split("routes")[0]}/assets/pops/${req.query.popId}/output.m3u8`);
// });

router.get("/data", async (req, res) => {
  const pop = await Pop.findOne({
    uuid: req.query.popId
  });
  if (pop.length) {
    res.json(convertPopSwap(pop));
  } else {
    res.status(500).json(
      {
        error: true,
        reason: "no video with id " + req.query.popId
      })
  }
});

router.get("/myPops", auth, async (req, res) => {
  // TODO: FOrmat pops with convertpopswap
  res.json(req.DBUser.pops);
});

router.get("/childSwaps", (req, res) => {
  res.redirect(`/swaps/onPop?popId=${req.query.popId}`);
});

router.post("/rate", async (req, res) => {
  const pop = await Pop.findOne({
    uuid: req.query.popId
  });

  var er = null;

  if(!pop) {
    er = "no pop with id " + req.query.popId;
  }

  const rMax = 2;
  const rVal = parseInt(req.query.ratingValue);

  if((rMax < rVal || isNaN(rVal) || rVal < 0)) {
    er = `invalid rating values ${rMax < rVal} ${isNaN(rVal)} ${rVal < 0}`;
  }


  if(er) {
    return res.status(500)
    .json(
      {
        error: true,
        reason: er
      }
    )
  }

  // get the average rating of the pop using the ratingNum and ratingDen
  // if the pop has no ratingNum or ratingDen, set them to 0




  if(pop.ratingNum == undefined) {
    pop.ratingNum = rVal;
    pop.ratingDen = rMax;
  } else {
    pop.ratingNum += rVal;
    pop.ratingDen += rMax;
  }

  //set a rating out of 100 
  pop.rated = Math.round((pop.ratingNum / pop.ratingDen) * 100);

  console.log(pop.rated)


  await pop.save();

  res.json({
    success: true,
    pop: convertPopSwap(pop)
  });
});


module.exports = router;

async function forceMOV() {
  //maybe use bash and ffmpeg to convert files
  //https://nodesource.com/blog/how-to-run-shell-and-more-using-Nodejs
}
