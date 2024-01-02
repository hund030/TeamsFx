const path = require("path");
const fs = require("fs");
const semver = require("semver");

function main() {
  const preid = process.argv[2];
  console.log("================= preversion", preid);
  packageJsonPath = path.join(__dirname, "../package.json");
  const packageJson = require(packageJsonPath);
  const packageVersion = packageJson.version;
  if (!semver.prerelease(packageVersion) && preid === "rc") {
    packageJson.version = semver.inc(packageVersion, "minor");
    packageJson.version = semver.inc(packageJson.version, "prerelease", "alpha");
  }
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));
  console.log("writing package.json done. new version:", packageJson.version);
}
