var async = require('async');
var path = require('path');
var fs = require('fs');
var util = require('util');
var licenses = require('licenses');
var request = require('request');
var Registry = require('npm-registry');
var npm = new Registry({});

function fetchLicense(dep, cb) {
  console.log('Attempting to fetch license for: ', dep);
  var licensepath = path.join(__dirname, '..', 'licenses', dep + '.txt');
  if (fs.existsSync(licensepath)) {
    return cb();
  }

  // Lookup package
  npm.packages.get(dep, function(err, data) {
    var github = data[0].github;
    var license_url = "https://raw.githubusercontent.com/" + github.user + "/" + github.repo + "/master/LICENSE";

    licenses(dep, function fetched(err, license) {
      var license_type = license.join(',');

      request.get({
        url: license_url
      }, function(err, httpResponse, body) {
        if (err) {
          return cb(err);
        }

        if (httpResponse.statusCode !== 200) {
          var error = 'Error fetching license: ' + license_url + '. HTTP code: ' + httpResponse.statusCode + '. Check https://github.com/' + github.user + '/' + github.repo + ' repo for license';
          console.error(error);
          return cb(new Error(error));
        }

        var licensepath = path.join(__dirname, '..', 'licenses', dep + '.txt');
        console.log('Writing license file');
        fs.writeFile(licensepath, [dep, license_type, body].join('\n'), function(err) {
          if (err) return cb(err);

          console.log('License file wrote: ', licensepath);

          return cb();
        });
      });
    });
  });
}

function generator(name, libs, callback){
  async.map(libs, function(dep, cb){
    var licensepath = path.join(__dirname, '..', 'licenses', dep+'.txt');
    fetchLicense(dep, function(err) {
      console.log('Attempted to fetch license for', dep, err);
    });

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