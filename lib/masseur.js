/* massage-couch
 * (c) 2014 Johannes J. Schmidt, null2 GmbH, Berlin 
 */

var es = require('event-stream');
var nano = require('nano');

module.exports = function masseur(url, options) {
  options = options || {};

  var config = {};
  var db = nano(url);
  var statusDoc = {
    _id: '_local/massage-couch',
    last_seq: 0
  };
  var lastSeq;

  var changesOptions = {
    include_docs: true
  };

  if (options.changes_feed_timeout) {
    changesOptions.timeout = options.changes_feed_timeout;
  }


  function storeCheckpoint(seq) {
    if (statusDoc.last_seq === seq) {
      return;
    }

    statusDoc.last_seq = seq;
    db.head(statusDoc._id, function(err, _, headers) {
      if (!err && headers && headers.etag) {
        statusDoc._rev = JSON.parse(headers.etag);
      }
      db.insert(statusDoc, statusDoc._id);
    });
  }


  return es.pipeline(
    // kick off
    es.readArray([1])

    // TODO: doit.
  )

  // store checkpoint at the end
  .on('end', function() {
    if (lastSeq) {
      storeCheckpoint(lastSeq);
    }
  });
};
