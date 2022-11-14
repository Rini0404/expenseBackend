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

    // addeed childSwapIds for our pops/all returns -Rini
    const { uuid, description, topic, creator, audience, childSwapIds } = popSwapOrArray;
    return {
        uuid,
        description,
        topic,
        creator,
        audience,
        childSwapIds
    }
}

module.exports = { convertPopSwap, getPops };