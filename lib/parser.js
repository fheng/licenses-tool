var _ = require('lodash');
var fs = require('fs');

var fhmodules = 'fh-';

function getDeps(packagejson){
  var deps = packagejson.dependencies || packagejson.libs;
  var keys = _.isArray(deps)? deps: _.keys(deps);
  return _.filter(keys, function(value){
    if(value.indexOf(fhmodules) === 0){
      return false;
    } else {
      return true;
    }
  });
}

function parse(src){
  console.log('Src:', src);
  var content = fs.readFileSync(src, 'utf8');
  var packages = JSON.parse(content);
  var name = packages.name;
  var deps = getDeps(packages);
  return {
    name: name,
    libs: deps
  };
}

module.exports = parse;