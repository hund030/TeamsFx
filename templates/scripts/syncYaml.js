const fs = require("fs-extra");
const path = require("path");
const utils = require("./utils");

// yml template folders
const ymlTemplateFolders = ["js", "ts", "csharp"].map((folder) =>
  path.resolve(__dirname, "..", "assets", "yml", "templates", folder)
);

function filterYmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  return utils.filterFiles(dir, fileList, (file) => file.endsWith(".yml"));
}

function parseInput() {
  const ymlPath = process.argv[2];
  // no input, return all yml files
  if (!ymlPath) {
    return ymlTemplateFolders.reduce(
      (ymlFiles, folder) => [...filterYmlFiles(folder), ...ymlFiles],
      []
    );
  }
  // input is a folder, return all yml files in folder
  if (fs.lstatSync(ymlPath).isDirectory()) {
    return filterYmlFiles(ymlPath);
  }
  if (!ymlPath.endsWith(".yml")) {
    throw new Error("Invalid yml file path");
  }
  if (!fs.existsSync(ymlPath)) {
    throw new Error("Invalid path");
  }
  // return input yml file
  return [ymlPath];
}

function strToObj(str) {
  var properties = str.split(";");
  var obj = {};
  properties.forEach(function (property) {
    var tup = property.split(":");
    obj[tup[0].trim()] = tup[1].trim();
  });
  return obj;
}

// read all yml files in folder as mustache variables
function getYmlFilesAsMustache(dir) {
  let result = {};
  filterYmlFiles(dir, []).map((file) => {
    const yml = fs.readFileSync(file, "utf8");
    result = { ...result, ...{ [path.basename(file, ".yml")]: yml } };
  });
  return result;
}

parseInput().map((file) => {
  const template = fs.readFileSync(file);
  const variables = getYmlFilesAsMustache(
    path.resolve(__dirname, "..", "assets", "yml", "snippets")
  );
  const result = utils.renderMustache(template.toString(), variables);
  const ymlFileName = path.basename(file) + ".tpl";
  const templateName = path.basename(path.dirname(file));
  const folderName = path.basename(path.dirname(path.dirname(file)));
  const ymlPath = path.resolve(__dirname, "..", folderName, templateName, ymlFileName);
  fs.writeFileSync(ymlPath, result);
});
