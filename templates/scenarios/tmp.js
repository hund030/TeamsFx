const fs = require("fs-extra");
const path = require("path");

const dir = __dirname;

fs.readdir(dir, (err, files) => {
  files.forEach((file) => {
    if (
      file === "tmp.js" ||
      file === "init-infra" ||
      file === "common" ||
      file === "js" ||
      file === "ts" ||
      file === "csharp"
    ) {
      return;
    }
    if (fs.existsSync(path.resolve(dir, file))) {
      const a = file.split("-");
      const lang = a[a.length - 1];
      const scenario = a.slice(0, -1).join("-");
      fs.ensureDirSync(path.resolve(dir, lang, scenario));
      fs.copySync(path.resolve(dir, file), path.resolve(dir, lang, scenario));
      fs.rmdirSync(path.resolve(dir, file), { recursive: true, force: true });
    }
  });
});
