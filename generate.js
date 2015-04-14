#!/usr/bin/env node

var programe = require('commander');
var async = require('async');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var parser = require('./lib/parser');
var generator = require('./lib/generator');
var writer = require('./lib/writer');

programe
  .version('0.0.1')
  .usage('[options] <target dir to write the license file>')
  .option('-m, --meta [value]', 'Specify the path to a json file which describes the dependencies for generating the single licenses.txt file')
  .option('-a, --all [value]', 'Specify the path to a json file contains the paths of an array of meta data files for generating an overarching license file')
  .parse(process.argv);

if(!programe.args.length){
  programe.outputHelp();
  process.exit(1);
}

var targetModule = programe.args[0];

function generateLicense(target, callback){
  var metajson = path.join(target, 'package.json');
  if(programe.meta){
    metajson = programe.meta;
  }
  if(!fs.existsSync(metajson)){
    throw new Error('can not find package.json file at ' + metajson);
  }
  var parsed = parser(metajson);
  var name = parsed.name;
  var libs = parsed.libs;
  generator(libs, function(err, results){
    if(err){
      return callback(err);
    } else {
      var targetFile = path.join(target, 'licenses.txt');
      return writer.write(targetFile, name, results, callback);
    }
  });
}

function generateLicenseForAll(target, callback){
  if(!fs.existsSync(programe.all)){
    throw new Error('can not find file specified at ' + programe.all);
  }
  var content = fs.readFileSync(programe.all, 'utf8');
  var allmeta = JSON.parse(content);
  async.map(allmeta, function(meta, cb){
    var parsed = parser(meta);
    var name = parsed.name;
    var libs = parsed.libs;
    generator(libs, function(err, results){
      if(err){
        return cb(err);
      } else {
        return cb(null, {
          name: name,
          licenses: results
        });
      }
    });
  }, function(err, allmodules){
    if(err){
      return callback(err);
    } else {
      var targetFile = path.join(target, 'licenses.txt');
      return writer.writeAll(targetFile, allmodules, callback);
    }
  });
}

var invoke = generateLicense;
if(programe.all){
  invoke = generateLicenseForAll;
}

invoke(targetModule, function(err){
  if(err){
    console.error(err);
    process.exit(1);
  } else {
    console.log('Done');
    process.exit(0);
  }
});
