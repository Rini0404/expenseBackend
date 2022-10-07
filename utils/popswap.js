

class Swap {
    childSwaps = [];
    constructor(uuid, desc, poster, title, parentUUID) {
        this.uuid = uuid;
        this.desc = desc;
        this.poster = poster;
        this.title = title;
        this.parentUUID = parentUUID;
    }

    static getByUUID(uuid) {
        
    }

    getChild(index) {
        const uuid = this.childSwaps[index];

        
    }
}

class Pop extends Swap {

}

module.exports = { Swap, Pop };