const File = require("filec").FileClass;

class Pop {
    childSwaps = [];
    constructor(uuid, description, creator, topic, audience) {
        this.uuid = uuid;
        this.description = description;
        this.creator = creator;
        this.topic = topic;
        this.audience = audience;
        this.file = new File(`./popswaps/${uuid}.json`);
    }

    get json() {
        return {
            uuid: this.uuid,
            description: this.description,
            creator: this.creator,
            topic: this.topic,
            parentUUID: this.parentUUID,
            childSwaps: this.childSwaps
        };
    }

    get str() {
        return JSON.stringify(this.json);
    }

    write() {
        return this.file.writer().bulkWriter().write(this.str);
    }

    static async getByUUID(uuid) {
        new File("./popswaps").mkDirs();
        const popSwap = new File(`./popswaps/${uuid}.json`);
        if(!await popSwap.exists()) {
            return null;
        }

        const d = JSON.parse(await popSwap.reader().read("utf-8"));
        return new Swap(d.uuid, d.description, d.creator, d.topic, d.parentUUID);
    }

    getChild(index) {
        return Swap.getByUUID(this.childSwaps[index]);
    }
}

class Swap extends Pop {
    constructor(uuid, description, creator, topic, audience, parentUUID) {
        super(uuid, description, creator, topic, audience);
        this.parentUUID = parentUUID;
    }

    
    get parent() {
        return Pop.getByUUID(this.parentUUID);
    }
}

module.exports = { Swap, Pop };