const express = require("express");
const router = express.Router();
const { ChildSwap } = require("../models/PopSwapSchema");


router.get('/:uuid', async (req, res) => {
  const child = await ChildSwap.findOne({ uuid: req.params.uuid });

  if (!child) {
    return res.status(404).json({ msg: 'Child not found' });
  }

  res.json(child);

});

module.exports = router;