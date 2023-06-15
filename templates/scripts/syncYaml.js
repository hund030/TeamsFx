const fs = require("fs-extra");
const path = require("path");
const mustache = require("mustache");
const utils = require("./utils");

function getYmlFiles(dir, fileList = []) {
  return utils.getFiles(dir, fileList, (file) => file.endsWith(".yml"));
}

// read all yml files in folder as mustache variables
function getYmlFilesAsMustache(dir) {
  let result = {};
  getYmlFiles(dir, []).map((file) => {
    const yml = fs.readFileSync(file, "utf8");
    result = { ...result, ...{ [path.basename(file, ".yml")]: yml } };
  });
  return result;
}

const tabYmlFile = path.resolve(__dirname, "..", "assets", "yml", "tab.yml");
const template = fs.readFileSync(tabYmlFile);
const variables = getYmlFilesAsMustache(
  path.resolve(__dirname, "..", "assets", "yml", "templates")
);
console.log(variables);
const result = mustache.render(template.toString(), variables);
fs.writeFileSync(path.resolve(__dirname, "..", "assets", "yml", "tab.yml"), result);
