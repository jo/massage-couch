var test = require('tap').test;
var es = require('event-stream');
var configure = require('../lib/configure');

var couch = 'http://localhost:5984';
var dbname = 'massage-couch-test';

var nano = require('nano')(couch);
var db = nano.use(dbname);

function testWithDb(name, tests) {
  test(name, function(t) {
    nano.db.create(dbname, function(err, resp) {
      t.equal(err, null, 'no error');
      t.deepEqual(resp, { ok: true }, 'no error');

      nano.db.get(dbname, function(err, body) {
        t.equal(err, null, 'no error');
        t.deepEqual(body.db_name, dbname, 'operating on correct db');

        tests(t, function() {
          nano.db.destroy(dbname, function(err, resp) {
            t.equal(err, null, 'no error');
            t.deepEqual(resp, { ok: true }, 'no error');

            t.end();
          });
        });
      });
    });
  });
}

testWithDb('db setup', function(t, done) {
  t.ok(true, 'setup is ok');
  done();
});

testWithDb('simple config', function(t, done) {
  function myMasseur(doc, db, done) {
    console.log(doc);
    done();
  }
  
  var doc = {
    _id: '_design/myconfig',
    'massage-couch': {
      'mymasseur': myMasseur.toString()
    }
  };

  db.insert(doc, doc._id, function(err, resp) {
    t.equal(err, null, 'no error');
    t.ok(resp.ok, 'no error');

    var config = {};

    nano.db.changes(dbname, { include_docs: true }, function(err, changes) {
      t.equal(err, null, 'no error');

      es.pipeline(
        es.readArray(changes.results),

        configure(config, console.log, console.info)
      )
      .on('end', function() {
        t.ok(config['_design/myconfig/mymasseur'], 'should have mymasseur');
        t.equal(typeof config['_design/myconfig/mymasseur'], 'function', 'mymasseur should be compiled function');
        t.equal(config['_design/myconfig/mymasseur'].toString(), myMasseur.toString(), 'compiled function should have the same source');

        done();
      });
    });
  });
});
