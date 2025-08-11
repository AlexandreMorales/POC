const fs = require("fs");
const path = require("path");
const { readFolder } = require("./utils");

const outputCss = path.join(__dirname, "../dist/min.css");
fs.writeFileSync(outputCss, "", "utf8");
readFolder(path.join(__dirname, "../css"), ["base.css"], "css", outputCss);
