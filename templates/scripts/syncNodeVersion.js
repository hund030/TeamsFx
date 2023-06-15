const path = require("path");
const fs = require("fs-extra");
const utils = require("./utils");

// recursively read package.json files from all packages
function getPackageJsonFiles(dir) {
  return utils.getFiles(
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
  return utils.getFiles(dir, [], (file) => file.endsWith(".bicep") || file.endsWith(".bicep.tpl"));
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
