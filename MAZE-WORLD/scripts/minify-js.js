const fs = require("fs");
const path = require("path");
const { readFolderToMinify } = require("./utils");

const outputJs = path.join(__dirname, "../dist/min.js");
fs.writeFileSync(outputJs, "", "utf8");
readFolderToMinify(path.join(__dirname, "../js"), "js", outputJs);
