var test = require('tap').test;
var masseur = require('../lib/masseur');

test('missing argument', function(t) {
  t.equal(1, 1, 'should be equal');
  t.end();
});
