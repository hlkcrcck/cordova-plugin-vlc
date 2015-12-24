module.exports = function(context) {
  console.log('Installing VLC Framework To iOS Project');

  var util = context.requireCordovaModule("cordova-lib/src/cordova/util");
  var parser = context.requireCordovaModule("cordova-common").ConfigParser;
  var xml = util.projectConfig(context.opts.projectRoot);
  var config = new parser(xml);

  var xcode = context.requireCordovaModule('xcode');
  var shell = context.requireCordovaModule('shelljs');
  var fs = context.requireCordovaModule('fs');
  var path = context.requireCordovaModule('path');

  var projectPath = context.opts.projectRoot + '/platforms/ios/';
  var projectFile = projectPath + config.name() + '.xcodeproj/project.pbxproj';

  var project = xcode.project(projectFile);
  project.parseSync();

  var plugins = project.pbxGroupByName('Plugins');
  var id = context.opts.plugin.pluginInfo.id;
  if (process.env.VLC_FRAMEWORK_LOCATION===undefined) { throw new Error('environment variable VLC_FRAMEWORK_LOCATION not found'); }
  var srcFile = process.env.VLC_FRAMEWORK_LOCATION;
  console.log("111111111");
  console.log(srcFile);
  var frameworkFolder = srcFile.substring(srcFile.lastIndexOf('/')+1);
  console.log("2222222222");
  console.log(frameworkFolder);
  var pluginsPath;
  if ( /"/.test( plugins.path ) ){
    pluginsPath = plugins.path.match( /"(.*?)"/ )[1];
  } else {
    pluginsPath = pluginsPath;
  }
  console.log("33333333");
  console.log(pluginsPath);
  var targetDir = projectPath + pluginsPath + '/' + id + '/' + frameworkFolder;
  console.log("444444444");
  console.log(targetDir);

  if (!fs.existsSync(srcFile)) throw new Error('cannot find "' + srcFile + '" ios <framework>');
  if (fs.existsSync(targetDir)) throw new Error('target destination "' + targetDir + '" already exists');

  console.log("555555555");
  console.log(path.dirname(targetDir));
  shell.mkdir('-p', path.dirname(targetDir));
  shell.cp('-R', srcFile, path.dirname(targetDir)); // frameworks are directories

  var projectRelative = path.relative(projectPath, targetDir);
  project.addFramework(projectRelative, {customFramework: true});
  fs.writeFileSync(projectFile, project.writeSync());
  
  console.log('Finished Installing VLC Framework To iOS Project');
}
