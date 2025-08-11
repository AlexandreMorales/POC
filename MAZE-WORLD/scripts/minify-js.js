const fs = require("fs");
const path = require("path");
const { readFolder } = require("./utils");

const outputJs = path.join(__dirname, "../dist/min.js");
fs.writeFileSync(outputJs, "", "utf8");
readFolder(
  path.join(__dirname, "../js"),
  ["configs.js", "infos.js", "utils.js"],
  "js",
  outputJs
);
