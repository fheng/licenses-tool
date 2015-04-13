#!/usr/bin/env node

var programe = require('commander');
var async = require('async');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');

programe.parse(process.argv);

var fhmodules = 'fh-';
var targetModule = programe.args[0];

function getDeps(packagejson){
  var deps = packagejson.dependencies;
  return _.filter(_.keys(deps), function(value){
    if(value.indexOf(fhmodules) === 0){
      return false;
    } else {
      return true;
    }
  });
}

function generateTOC(licenses){
  var toc = _.map(licenses, function(value, index){
    return 'Section ' + (++index) + ' : ' + value.name;
  });
  return toc;
}

function writeLicenseFile(target, name, licenses, callback) {
  var targetFile = path.join(target, 'licenses.txt');
  if(fs.existsSync(targetFile)){
    console.log('Find existing licenses.txt file, remove it');
    fs.unlinkSync(targetFile);
  }
  var header = name+'\n';
  var toc = generateTOC(licenses).join('\n');
  var counter=1;
  fs.appendFile(targetFile, [header, toc].join('\n') + '\n\n', function(err){
    if(err){
      return callback(err);
    }
    async.eachSeries(licenses, function(license, cb){
      var contentHeader = '--------------- SECTION ' + (counter++) + ' : ' + license.name + ' ----------------';
      var content = [contentHeader, license.name + ' : ' + license.type, license.contents].join('\n') + '\n\n';
      fs.appendFile(targetFile, content, function(err){
        if(err){
          return cb(err);
        } else {
          console.log('Added ' + license.name + ' license');
          cb();
        }
      });
    }, function(err){
      if(err){
        callback(err);
      } else {
        console.log('licenses.txt file is written to ' + targetFile);
        callback();
      }
    });
  });
}

function generateLicense(target, callback){
  console.log(target);
  var packagejson = path.join(target, 'package.json');
  if(!fs.existsSync(packagejson)){
    throw new Error('can not find package.json file at ' + packagejson);
  }
  var content = fs.readFileSync(packagejson, 'utf8');
  var packages = JSON.parse(content);
  var name = packages.name;
  var deps = getDeps(packages);
  async.map(deps, function(dep, cb){
    var licensepath = path.join('.', 'licenses', dep+'.txt');
    fs.exists(licensepath, function(exists){
      if(exists){
        fs.readFile(licensepath, {encoding: 'utf8'}, function(err, content){
          if(err){
            return cb(err);
          }
          var contentArray = content.split('\n');
          var result = {
            name: contentArray.shift(0),
            type: contentArray.shift(0),
            link: contentArray.shift(0),
            contents: contentArray.join('\n')
          };
          return cb(null, result);
        });
      } else {
        return cb('license file ' + licensepath + ' does not exist');
      }
    });
  }, function(err, results){
    if(err){
      callback(err);
    } else {
      writeLicenseFile(target, name, results, callback);
    }
  });
}

generateLicense(targetModule, function(err){
  if(err){
    console.error(err);
    process.exit(1);
  } else {
    console.log('Done');
    process.exit(0);
  }
});