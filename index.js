/* massage-couch
 * (c) 2014 Johannes J. Schmidt, null2 GmbH, Berlin 
 */

var stream = require('./lib/listen');

var url = require('url');
var async = require('async');
var nano = require('nano');

module.exports = function(config, info, error) {
  config = config || {};
  info = info || console.log;
  error = error || console.error;

  // defaults
  config.address = config.address || 'localhost';
  config.port = config.port || 5984;
  config.streams = config.streams && parseInt(config.streams, 10) || 50;
  config.changes_feed_timeout = config.changes_feed_timeout && parseInt(config.changes_feed_timeout, 10) || 60 * 1000;

  // TODO: validate config


  var couch = url.format({
    protocol: 'http',
    hostname: config.address,
    port: config.port,
    auth: config.auth && config.auth.username && config.auth.password ? [ config.auth.username, config.auth.password ].join(':') : null
  });

  info('db: ' + JSON.stringify(couch));

  var options = {
    feed: 'continuous',
    changes_feed_timeout: config.changes_feed_timeout
  };

  info('options: ' + JSON.stringify(options));

  function listen(dbname, next) {
    info('Listening on ' + couch + '/' + dbname);

    var db = nano(couch).use(dbname);

    var changes = stream(db, options, info, error);

    changes.on('error', error);
    changes.on('data', function(data) {
      if (data.response) {
        info(data.response);
      }
    });

    changes.on('end', next);
  }


  // main loop ;)
  function run(err) {
    if (err) {
      error(err);
      process.exit(0);
    }


    // get list of all databases
    // TODO: listen to db changes
    nano(couch).db.list(function(err, dbs) {
      if (err) {
        error('Can not get _all_dbs: ' + err.description);

        return process.exit(0);
      }

      async.eachLimit(dbs, config.streams, listen, run);
    });
  }

  run();
};
