const path = require("path");
const { argv } = require("process");
const fs = require("fs-extra");

async function copyFileToDirectories(filePath, directories, targetPath) {
  for (const directory of directories) {
    await fs.copy(filePath, path.join(directory, targetPath, path.basename(filePath)));
  }
}

async function main() {
  const assetPath = path.resolve(argv[2]);

  const rulePath = path.resolve(__dirname, "..", "assets", "rules.json");
  const rules = await fs.readJSON(rulePath);
  const rule = rules[path.basename(assetPath)];
  if (!rule) {
    return;
  }

  const targetPath = rule.path;
  let directories = [];
  const filters = rule.templates;
  filters.forEach((filter) => {
    if (filter.endsWith("*")) {
      filter = filter.replaceAll("*", "");
      const parentFolder = path.resolve(__dirname, "..", filter);
      const files = fs.readdirSync(parentFolder);
      const subdirectories = files.filter((file) =>
        fs.statSync(path.join(parentFolder, file)).isDirectory()
      );
      directories = directories.concat(
        subdirectories.map((subdirectory) => path.join(parentFolder, subdirectory))
      );
    } else {
      directories.push(path.resolve(__dirname, "..", filter));
    }
  });

  await copyFileToDirectories(assetPath, directories, targetPath);
}

main();
