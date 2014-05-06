/* massage-couch
 * (c) 2014 Johannes J. Schmidt, null2 GmbH, Berlin 
 */

var pkg = require('./package.json');
var stream = require('./lib/listen');

var url = require('url');
var async = require('async');
var nano = require('nano');

module.exports = function(config, logger) {
  config = config || {};
  logger = logger || {
    info: function(msg) {
      console.info('[' + new Date + '] [info] Daemon "' + pkg.name + '" :: ' + msg);
    },
    error: function(msg) {
      console.error('[' + new Date, '] [error] Daemon "' + pkg.name + '" :: ' + msg);
    },
    debug: function(msg) {
      console.log('[' + new Date, '] [debug] Daemon "' + pkg.name + '" :: ' + msg);
    },
  };


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

  var options = {
    feed: 'continuous',
    changes_feed_timeout: config.changes_feed_timeout
  };

  function listen(dbname, next) {
    logger.info('Listening on ' + couch + '/' + dbname);

    var db = nano(couch).use(dbname);

    var changes = stream(db, options, logger);

    changes.on('error', logger.error);
    changes.on('data', function(data) {
      if (data.response) {
        logger.info(data.response);
      }
    });

    changes.on('end', next);
  }


  // main loop ;)
  function run(err) {
    if (err) {
      logger.error(err);
      process.exit(0);
    }


    // get list of all databases
    // TODO: listen to db changes
    nano(couch).db.list(function(err, dbs) {
      if (err) {
        logger.error('Can not get _all_dbs: ' + err.description);

        return process.exit(0);
      }

      async.eachLimit(dbs, config.streams, listen, run);
    });
  }

  run();
};
