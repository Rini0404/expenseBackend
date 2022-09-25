const fs = require("fs");

module.exports.getPops = () => {
    return fs.promises.readdir("./assets/pops");
}