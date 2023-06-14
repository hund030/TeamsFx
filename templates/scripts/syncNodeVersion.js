const path = require("path");
const fs = require("fs-extra");
const { get } = require("http");

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

// recursively read package.json files from all packages
function getPackageJsonFiles(dir) {
  return getFiles(
    dir,
    [],
    (file) => file.endsWith("package.json") || file.endsWith("package.json.tpl")
  );
}

// get engines in package.json
function getEnginesFromPackage(packageJsonPath) {
  const packageJson = fs.readJsonSync(packageJsonPath);
  return packageJson.engines;
}

// recursively read bicep files from all templates
function getBicepFiles(dir, fileList = []) {
  return getFiles(dir, [], (file) => file.endsWith(".bicep") || file.endsWith(".bicep.tpl"));
}

// get node version from bicep
function getNodeVersionFromBicep(bicepPath) {
  const bicep = fs.readFileSync(bicepPath, "utf8");
  const regex = /(?<=WEBSITE_NODE_DEFAULT_VERSION'\s+value:\s+')[^']+(?=')/;
  const matches = regex.exec(bicep);
  return matches?.[0];
}

getPackageJsonFiles(path.resolve(__dirname, "..", "js")).forEach((packageJsonPath) => {
  console.log(getEnginesFromPackage(packageJsonPath));
});
getBicepFiles(path.resolve(__dirname, "..", "js")).forEach((bicepPath) => {
  console.log(getNodeVersionFromBicep(bicepPath));
});
