/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse').parse

describe('collect()', function () {
  it('collects zero or more matches by default', function () {
    var parser = comb.collect(core.token())
    assert.deepEqual(parse(parser, 'abc'), ['a', 'b', 'c'])
  })
  it('succeeds even if no matches are found', function () {
    var parser = comb.collect(core.token())
    assert.deepEqual(parse(parser, ''), [])
  })
  it('accepts a minimum count', function () {
    var parser = comb.collect(core.token(), {min: 1})
    assert.deepEqual(parse(parser, 'a'), ['a'])
    assert.throws(function () {
      parse(parser, '')
    }, /unexpected eof/)
  })
  it('accepts a maximum count', function () {
    var parser = comb.followedBy(
      comb.collect(core.token(), {min: 1, max: 4}),
      comb.collect(core.token()))
    assert.deepEqual(parse(parser, 'aaaaa'), ['a', 'a', 'a', 'a'])
  })
})
