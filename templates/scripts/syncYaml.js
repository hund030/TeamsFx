const fs = require("fs-extra");
const path = require("path");
const utils = require("./utils");

// yml template folders
const ymlTemplateFolders = ["js", "ts", "csharp"].map((folder) =>
  path.resolve(__dirname, "..", "constraints", "yml", "templates", folder)
);

function filterYmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  return utils.filterFiles(dir, fileList, (file) => file.endsWith(".yml"));
}

function filterMustacheFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  return utils.filterFiles(dir, fileList, (file) => file.endsWith(".mustache"));
}

function parseInput() {
  const mustachePath = process.argv[2];
  // no input, return all mustache files
  if (!mustachePath) {
    return ymlTemplateFolders.reduce(
      (mustacheFiles, folder) => [...filterMustacheFiles(folder), ...mustacheFiles],
      []
    );
  }
  // input is a folder, return all mustache files in folder
  if (fs.lstatSync(mustachePath).isDirectory()) {
    return filterYmlFiles(mustachePath);
  }
  if (!mustachePath.endsWith(".mustache")) {
    throw new Error("Invalid mustache file path");
  }
  if (!fs.existsSync(mustachePath)) {
    throw new Error("Invalid path");
  }
  // return input mustache file
  return [mustachePath];
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
  filterMustacheFiles(dir, []).map((file) => {
    const mustache = fs.readFileSync(file, "utf8");
    result = {
      ...result,
      ...{
        [path.basename(file, ".mustache")]: function () {
          return function (text, render) {
            if (text.includes(":")) {
              return utils.renderMustache(mustache, strToObj(text)).trimEnd();
            }
            return utils.renderMustache(mustache, { [text.trim()]: true }).trimEnd();
          };
        },
      },
    };
  });
  return result;
}

parseInput().map((file) => {
  const template = fs.readFileSync(file);
  const variables = getYmlFilesAsMustache(
    path.resolve(__dirname, "..", "constraints", "yml", "snippets")
  );
  const result = utils.renderMustache(template.toString(), variables);
  const ymlFileName = path.basename(file, ".mustache") + ".yml.tpl";
  const templateName = path.basename(path.dirname(file));
  const folderName = path.basename(path.dirname(path.dirname(file)));
  const ymlPath = path.resolve(__dirname, "..", folderName, templateName, ymlFileName);
  fs.writeFileSync(ymlPath, result);
});
