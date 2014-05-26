/* massage-couch
 * (c) 2014 Johannes J. Schmidt, null2 GmbH, Berlin 
 */

var _ = require('highland');
var nano = require('nano');
var async = require('async');

module.exports = function masseur(url, options) {
  options = options || {};

  var couch = nano(url);
  var config = {};

  return _.pipeline(
    // gather configs
    _.map(function(data) {
      if (data && data.stream === 'compile') {
        Object.keys(data.doc).forEach(function(key) {
          config[data.id + '/' + key] = data.doc[key];
        });
      }
      return data;
    }),

    // process docs
    _.through(function(source) {
      return _(function(push, done) {
        source.on('data', function(data) {
          if (data && data.stream === 'changes' && data.doc && data.db_name) {
            async.eachSeries(Object.keys(config), function(key, next) {
              try {
                config[key](data.doc, couch.use(data.db_name), next);
              } catch(e) {
                push(null, {
                  type: 'log',
                  message: 'Error running ' + key + ': ' + e
                });
              }
            }, function(err, res) {
              push(null, {
                db_name: data.db_name,
                seq: data.seq,
                type: 'log',
                message: 'Complete: ' + data.db_name + '/' + data.doc._id
              });
            });
          }
        });
        source.on('error', push);
        source.on('end', done);
      });
    })
  );
};
