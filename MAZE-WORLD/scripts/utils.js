const fs = require("fs");

/**
 * @param {string} filePath
 * @param {string} extension
 * @param {string} output
 */
const writeMinFile = (filePath, extension, output) => {
  // Ignore index and JSDocs files
  if (
    filePath.endsWith(`index.${extension}`) ||
    filePath.endsWith(`interfaces.${extension}`)
  )
    return;

  try {
    let data = fs.readFileSync(filePath, "utf8");
    data = data
      // Remove exports
      .replaceAll("export ", "")
      // Remove imports
      .replaceAll(/import.+?from ".+?";/gs, "")
      // Remove JSDocs
      .replaceAll(/\/\*\*.+?\*\//gs, "")
      // Remove comments
      .replaceAll(/\/\/.+?\n/gs, "")
      // Remove break lines
      .replaceAll(/\n/gs, "");

    if (extension == "js")
      data = data
        // Remove spaces that are not between words or quotes
        .replaceAll(
          /(?=(?<!\w))\s+|\s+(?=(?!\w))(?=(?:[^'"`]*(['"`])[^'"`]*\1)*[^'"`]*$)/gi,
          ""
        );
    else
      data = data
        // Remove identation
        .replaceAll(/\s+/gi, " ")
        .replaceAll(/\/\s+/gi, "/")
        .replaceAll(/\s+\//gi, "/")
        .replaceAll(/\>\s+/gi, ">")
        .replaceAll(/\s+\>/gi, ">")
        .replaceAll(/\{\s+/gi, "{")
        .replaceAll(/\s+\{/gi, "{")
        .replaceAll(/\,\s+/gi, ",")
        .replaceAll(/\;\s+/gi, ";")
        .replaceAll(/\:\s+/gi, ":");

    fs.appendFileSync(output, data, "utf8");
  } catch (err) {
    return;
  }
};

/**
 * @param {string[]} dirPaths
 * @param {string} extension
 * @param {string} output
 */
const readDirToMinify = (dirPaths, extension, output) => {
  dirPaths.forEach((dirPath) => {
    if (dirPath.endsWith(extension)) writeMinFile(dirPath, extension, output);
    else readFolderToMinify(dirPath, extension, output);
  });
};

/**
 * @param {string} folderPath
 * @param {string} extension
 * @param {string} output
 */
const readFolderToMinify = (folderPath, extension, output) => {
  const dirs = fs.readdirSync(folderPath);
  const normalDirs = [];
  const firstDirs = [];

  // Always read files and folders with _ in the front
  dirs.forEach((dirPath) => {
    const fullPath = `${folderPath}/${dirPath}`;
    if (dirPath.startsWith("_")) firstDirs.push(fullPath);
    else normalDirs.push(fullPath);
  });
  readDirToMinify(firstDirs, extension, output);
  readDirToMinify(normalDirs, extension, output);
};

module.exports = { readFolderToMinify };
