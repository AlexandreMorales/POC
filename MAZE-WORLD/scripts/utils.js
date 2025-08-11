const fs = require("fs");

/**
 * @param {string} filePath
 * @param {string} extension
 * @param {string} output
 */
const readFile = (filePath, extension, output) => {
  if (
    filePath.endsWith(`index.${extension}`) ||
    filePath.endsWith(`interfaces.${extension}`) ||
    filePath.endsWith(`min.${extension}`)
  )
    return;

  try {
    let data = fs.readFileSync(filePath, "utf8");
    data = data
      .replaceAll("export ", "")
      .replaceAll(/import.+?from ".+?";/gs, "")
      .replaceAll(/\/\*\*.+?\*\//gs, "")
      .replaceAll(/\/\/.+?\n/gs, "")
      .replaceAll(/\n/gs, "")
      .replaceAll(/\s\s/gs, "");
    fs.appendFileSync(output, data, "utf8");
  } catch (err) {
    return;
  }
};

/**
 * @param {string} folderPath
 * @param {string[]} filesToGoFirst
 * @param {string} extension
 * @param {string} output
 */
const readFolder = (folderPath, filesToGoFirst, extension, output) => {
  filesToGoFirst.forEach((f) =>
    readFile(`${folderPath}/${f}`, extension, output)
  );
  fs.readdirSync(folderPath).forEach((dirPath) => {
    dirPath = `${folderPath}/${dirPath}`;
    if (dirPath.endsWith(extension)) {
      if (filesToGoFirst.find((f) => dirPath.endsWith(f))) return;
      readFile(dirPath, extension, output);
    } else readFolder(dirPath, filesToGoFirst, extension, output);
  });
};

module.exports = { readFile, readFolder };
