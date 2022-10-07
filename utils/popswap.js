const File = require("filec").FileClass;

class Pop {
    childSwaps = [];
    constructor(uuid, desc, poster, title) {
        this.uuid = uuid;
        this.desc = desc;
        this.poster = poster;
        this.title = title;
        this.file = new File(`./popswaps/${uuid}.json`);
    }

    write() {
        return this.file.writer().bulkWriter().write(JSON.stringify(
            {
                uuid: this.uuid,
                desc: this.desc,
                poster: this.poster,
                title: this.title,
                parentUUID: this.parentUUID
            }
        ));
    }

    static async getByUUID(uuid) {
        new File("./popswaps").mkDirs();
        const popSwap = new File(`./popswaps/${uuid}.json`);
        if(!await popSwap.exists()) {
            return null;
        }

        const d = JSON.parse(await popSwap.reader().read("utf-8"));
        return new Swap(d.uuid, d.desc, d.poster, d.title, d.parentUUID);
    }

    getChild(index) {
        return Swap.getByUUID(this.childSwaps[index]);
    }
}

class Swap extends Pop {
    constructor(uuid, desc, poster, title, parentUUID) {
        super(uuid, desc, poster, title);
        this.parentUUID = parentUUID;
    }

    
    get parent() {
        return Swap.getByUUID(this.parentUUID);
    }
}

module.exports = { Swap, Pop };