/* massage-couch
 * (c) 2014 Johannes J. Schmidt, null2 GmbH, Berlin 
 */

var pkg = require('./package.json');
var changes = require('./lib/changes');

var assert = require('assert');
var url = require('url');
var async = require('async');
var nano = require('nano');


// used in client and test
var defaultLogger = {
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


module.exports = function(config, logger) {
  config = config || {};
  logger = logger || defaultLogger;


  // defaults
  config.address = config.address || 'localhost';
  config.port = config.port || 5984;
  config.streams = config.streams && parseInt(config.streams, 10) || 20;
  config.timeout = config.timeout && parseInt(config.timeout, 10) || 60 * 1000;

  // validate config
  assert.equal(typeof config.streams, 'number', 'streams must be a number');
  assert.equal(parseInt(config.streams), config.streams, 'streams must be an interger');
  assert.ok(config.streams > 0, 'streams must be a positive non-zero');
  assert.equal(typeof config.timeout, 'number', 'timeout must be a number');
  assert.equal(parseInt(config.timeout), config.timeout, 'timeout must be an interger');
  assert.ok(config.timeout > 0, 'timeout must be a positive non-zero');


  var couchUrl = url.format({
    protocol: 'http',
    hostname: config.address,
    port: config.port,
    auth: config.auth && config.auth.username && config.auth.password ? [ config.auth.username, config.auth.password ].join(':') : null
  });
  var couch = nano(couchUrl);

  var options = {
    feed: 'continuous',
    timeout: config.timeout
  };


  function listen(task, next) {
    var dbname = task.dbname;

    logger.info('Listening on ' + couchUrl + '/' + dbname);

    changes(couch.use(dbname), options, logger)
      .on('error', logger.error)
      .on('data', function(data) {
        if (data.response) {
          logger.info(data.response);
        }
      })
      .on('end', function() {
        // add to the end of queue
        q.push(task);
        next();
      });
  }

  
  var q = async.queue(listen, config.streams);

  couch.db.list(function(err, dbs) {
    if (err) {
      logger.error('Can not get _all_dbs: ' + err.description);

      return process.exit(0);
    }

    dbs.forEach(function(db) {
      q.push({ dbname: db });
    });
  });
};
