const fs = require('fs')
const json = require('json')
var path = require("path")
let pkgs = require(path.join(__dirname,'../../lerna.json')).packages;
let versions = {}
// console.log('====', pkgs)
for(pkg of pkgs) {
    pkg = path.join('../..', pkg, 'package.json');
    pkg = require(pkg);
    // console.log('=======', pkg.name);
    versions[pkg.name] = pkg.version
}

for(ver in versions) {
    console.log(ver + " ===== " + versions[ver]);
}

// function listFile(dir, list=[]){
// 	var arr = fs.readdirSync(dir);
// 	arr.forEach(function(item){
// 		var fullpath = path.join(dir,item);
// 		var stats = fs.statSync(fullpath);
//         if(item === 'node_modules')
//             return list;
// 		if(stats.isDirectory()){
// 			listFile(fullpath, list)
// 		}else {
//             if(item === 'package.json')
//             list.push(fullpath);
// 		}
// 	});
// 	return list;
// }

// const dir = path.join(__dirname,"..")
// var res = listFile(dir);
// let result = []
// for(a of res){
//     console.log('=====', a);
//     let pkg_ = require(a);
//     // console.log('-----', pkg_.name)
//     let dep = pkg_.dependencies;
//     // dep = JSON.parse(dep);
//     console.log('=====', dep);
//     // if(dep['@microsoft/teamsfx']){
//     //     console.log('123')
//     // }
//     // console.log(Object.keys(dep))
// }