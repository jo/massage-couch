/* massage-couch
 * (c) 2014 Johannes J. Schmidt, null2 GmbH, Berlin 
 */

var pkg = require('../package.json');

var es = require('event-stream');
var vm = require('vm');


function isConfigDoc(doc) {
  return doc &&
    doc._id.match(/^_design\//) &&
    typeof doc[pkg.name] === 'object';
}

module.exports = function(config, info, error) {
  var context = {
    log: info
  };

  // compile masseur functions
  function compile(obj, id) {
    Object.keys(obj).forEach(function(key) {
      var name = [id, key].join('/');
      var source = '(' + obj[key] + ')';
      var filename = 'massage-couch:' + name + '.js';

      info('Compiling ' + name);

      try {
        var script = vm.createScript(source, filename);
        config[name] = script.runInNewContext(context);
      } catch(e) {
        error('Error compiling ' + name + ': ' + e);
      }
    });
  }

  function configure(data, done) {
    if (isConfigDoc(data.doc)) {
      compile(data.doc[pkg.name], data.id, context);
    }

    done(null, data);
  }


  return es.map(configure)
};
