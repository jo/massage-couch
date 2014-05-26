#!/usr/bin/env node
/* massage-couch: Massage CouchDB documents with an os daemon worker.
 *
 * (c) 2014 Johannes J. Schmidt, null2 GmbH, Berlin 
 */

var pkg = require('./package.json');
var masseur = require('./lib/masseur');

var daemon = require('couch-daemon');


daemon({
  name: pkg.name,
  version: pkg.version,
  include_docs: true
}, function(url, options) {
  var massage = masseur(url, options);

  return function(source) {
    return source.through(massage);
  };
});

