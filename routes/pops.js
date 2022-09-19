const express = require('express')
const router = express.Router()
const fileUpload = require("express-fileupload");
const { getPops } = require("../utils/fsHandlers");
const videoPath = "./assets/pops";
const uuid = require('uuid-random');

// @route    POST /pops
// @desc     Save uploads to assets/pops/[uuid].mov
// @access   Public
router.post("/", fileUpload({ createParentPath: true }), async function (req, res) {
    console.log(req.files, req.body); 
    //TODO: req.body should have as much data as possible from the sending app and attach it to the uuid object
    //this data will be used to find filter and sort the pops later

    let uploadSuccess = false;
    let recent_upload;

    if (req.files) {
        //TODO: if the file type is not  mimetype: 'video/quicktime', forceMOV();

        for (let elmName in req.files) {
            const file = req.files[elmName];
            if (!(file instanceof Array)) {
                recent_upload = `${uuid()}.mov` //TODO: maybe programatically remane file to .mov in forceMOV()
                await file.mv(`${videoPath}/${recent_upload}`);
                uploadSuccess = true;
                break;
            }
        }
    }

    res.json({ success: uploadSuccess, recent_upload: `${recent_upload}`, pops: (await getPops()).map(vidName => `pops/${vidName}`) }).end();
});

router.get("/all", async (req, res) => {
    res.json({ pops: (await getPops()).map(vidName => `pops/${vidName}`) }).end();
})

router.get("/me", async (req, res) => {
    res.json({ pops: (await getPops()).map(vidName => `pops/${vidName}`) }).end();
})

module.exports = router

async function forceMOV() {
    //maybe use bash and ffmpeg to convert files
    //https://nodesource.com/blog/how-to-run-shell-and-more-using-Nodejs 
}