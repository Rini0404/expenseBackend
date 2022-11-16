const { Pop } = require("../models/PopSwapSchema")

async function getPops() {
    return await Pop.find();
}

function convertPopSwap(popSwapOrArray) {
    if(popSwapOrArray instanceof Array) {
        const convAr = [];
        for(ps of popSwapOrArray) {
            convAr.push(convertPopSwap(ps));
        }

        return convAr;
    }
    const { uuid, description, topic, creator, audience, childSwapIds, ratingNum, ratingDen, rated } = popSwapOrArray;
    return {
        uuid,
        description,
        topic,
        creator,
        audience,
        childSwapIds,
        rated,
        ratingNumerator: ratingNum,
        ratingDenominator: ratingDen,
    }
}

module.exports = { convertPopSwap, getPops };