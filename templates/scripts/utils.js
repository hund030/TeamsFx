const path = require("path");
const fs = require("fs-extra");

function getFiles(dir, fileList = [], filter = (file) => true) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      fileList = getFiles(filePath, fileList, filter);
    } else if (filter(file)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

module.exports = {
  getFiles,
};
