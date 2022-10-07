const express = require("express");
const { Pop, Swap } = require("../utils/popswap");
const uuid = require("uuid-random");
const fileUpload = require("express-fileupload");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const router = express.Router();

router.post("/",
    fileUpload({
        createParentPath: true,
    }),
    async (req, res) => {
        if(req.body.type == "pop") {
            const pop = new Pop(uuid(), req.body.description, req.body.creator, req.body.topic, req.body.audience);
            await pop.write();

            for (let elmName in req.files) {
                const file = req.files[elmName];
                if (!(file instanceof Array)) {
                    const vidPath = `./popswaps/videos/${pop.uuid}.mov`;
                    await file.mv(vidPath);
                    await extFrms({
                        input: vidPath,
                        output: `${vidPath}/${pop.uuid}.jpg`,
                        offsets: [0],
                        ffmpegPath,
                    });
                }
            }

            res.json(pop.json);
        } else {
            if(!req.body.parent) {
                return res.json({error: "no parent uuid given"});
            }

            const parent = await Swap.getByUUID(req.body.parent);

            if(parent == null) {
                return res.json({error: "no parent with uuid " + req.body.parent});
            }

            const swap = new Swap(uuid(), req.body.description, req.body.creator, req.body.topic, req.body.audience, parent.uuid);
            parent.childSwaps.push(swap.uuid);

            await parent.write();
            await swap.write();

            for (let elmName in req.files) {
                const file = req.files[elmName];
                if (!(file instanceof Array)) {
                    const vidPath = `./popswaps/videos/${swap.uuid}.mov`;
                    await file.mv(vidPath);
                    await extFrms({
                        input: vidPath,
                        output: `${vidPath}/${swap.uuid}.jpg`,
                        offsets: [0],
                        ffmpegPath,
                    });
                }
            }

            res.json(swap.json);
        }
});

module.exports = router;