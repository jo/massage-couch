#!/usr/bin/env node
/* massage-couch
 * (c) 2014 Johannes J. Schmidt, null2 GmbH, Berlin 
 */

var masseur = require('..');

if (process.argv.indexOf('-v') > -1 || process.argv.indexOf('--version') > -1) {
  var pkg = require('../package.json');
  console.log(pkg.name, pkg.version);
  process.exit(0);
}

masseur();
