/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse').parse

describe('exactly()', function () {
  it('collects exactly n matches', function () {
    var parser = comb.followedBy(comb.exactly(core.token(), 3),
                                 comb.collect(core.token()))
    assert.deepEqual(parse(parser, 'aaaaaaa'), ['a', 'a', 'a'])
    assert.throws(function () {
      parse(parser, 'aa')
    }, /unexpected eof/)
  })
})
