var async = require('async');
var path = require('path');
var fs = require('fs');

function generator(libs, callback){
  async.map(libs, function(dep, cb){
    var licensepath = path.join(__dirname, '..', 'licenses', dep+'.txt');
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
  }, callback);
}

module.exports = generator;