var async = require('async');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var Handlebars = require('handlebars');
var moment = require('moment');

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});


function readTempalte(file, callback){
  var template = path.join(__dirname, '..', 'templates', file);
  if(!fs.existsSync(template)){
    return callback('no template find at ' + template);
  }
  fs.readFile(template, {encoding: 'utf8'}, function(err, content){
    if(err){
      return callback(err);
    } else {
      var t = Handlebars.compile(content);
      return callback(null, t);
    }
  });
}


function writeFile(targetFile, name, licenses, callback){
  if(fs.existsSync(targetFile)){
    console.log('Find existing licenses.txt file, remove it');
    fs.unlinkSync(targetFile);
  }
  readTempalte('single.hbs', function(err, template){
    if(err){
      return callback(err);
    } else {
      var content = template({name: name, licenses: licenses});
      fs.writeFile(targetFile, content, callback);
    }
  });
}

function getDate(){
  return moment().format('YYYY-MM-DD');
}

function writeAll(targetFile, modules, callback){
  if(fs.existsSync(targetFile)){
    console.log('Find existing licenses.txt file, remove it');
    fs.unlinkSync(targetFile);
  }
  readTempalte('all.hbs', function(err, template){
    if(err){
      return callback(err);
    } else {
      var content = template({modules: modules, lastUpdate: getDate()});
      fs.writeFile(targetFile, content, callback);
    }
  });
}

module.exports = {
  write: writeFile,
  writeAll: writeAll
};