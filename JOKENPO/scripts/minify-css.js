const fs = require("fs");
const path = require("path");
const { readFolderToMinify } = require("./utils");

const outputCss = path.join(__dirname, "../dist/min.css");
fs.writeFileSync(outputCss, "", "utf8");
readFolderToMinify(path.join(__dirname, "../css"), "css", outputCss);
