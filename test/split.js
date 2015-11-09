/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse').parse
var strs = require('@mona/strings')

describe('split()', function () {
  it('returns an array of values separated by a separator', function () {
    assert.deepEqual(
      parse(comb.split(core.token(), strs.string('.')), 'a.b.c.d'),
      ['a', 'b', 'c', 'd'])
  })
  it('returns an empty array if it fails', function () {
    assert.deepEqual(parse(comb.split(strs.string('a'), strs.string('.')),
    ''),
    [])
  })
  it('accepts a min count', function () {
    var parser = comb.split(core.token(), strs.string('.'), {min: 3})
    assert.deepEqual(parse(parser, 'a.b.c'), ['a', 'b', 'c'])
    assert.throws(function () {
      parse(parser, 'a.b')
    }, /\(line 1, column 4\) expected string matching {.}/)
  })
  it('accepts a max count', function () {
    var parser = comb.split(core.token(), strs.string('.'), {max: 3})
    assert.deepEqual(parse(comb.and(parser, strs.string('.d')), 'a.b.c.d'),
    '.d')
  })
})
