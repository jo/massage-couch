#!/usr/bin/env node
/* massage-couch
 * (c) 2014 Johannes J. Schmidt, null2 GmbH, Berlin 
 */

var pkg = require('../package.json');
var masseur = require('..');

var daemon = require('couch-daemon')(process.stdin, process.stdout, function() {
  process.exit(0);
});

daemon.get({
  address: 'httpd.bind_address',
  port: 'httpd.port',
  auth: {
    username: pkg.name + '.username',
    password: pkg.name + '.password'
  },
  streams:     pkg.name + '.streams',
  changes_feed_timeout:    pkg.name + '.changes_feed_timeout'
}, function(err, config) {
  if (err) {
    return process.exit(0);
  }

  masseur(config, {
    info: daemon.info,
    error: daemon.error,
    debug: daemon.debug
  });
});
