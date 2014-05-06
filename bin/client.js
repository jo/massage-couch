#!/usr/bin/env node
/* massage-couch
 * (c) 2014 Johannes J. Schmidt, null2 GmbH, Berlin 
 */

var masseur = require('..');

var options = require('minimist')(process.argv.slice(2), {
  booleans: ['version']
});


if (options.version) {
  var pkg = require('../package.json');
  console.log(pkg.name, pkg.version);
  process.exit(0);
}


if (options.username) {
  options.auth = {
    username: options.username,
    password: options.password
  };
  delete options.username;
  delete options.password;
}
delete options._;

masseur(options);
