/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse')
var strs = require('@mona/strings')

describe('splitEnd()', function () {
  it('collects matches separated and ended by a parser', function () {
    assert.deepEqual(
      parse(comb.splitEnd(core.token(), strs.string('.')), 'a.b.c.d.'),
      ['a', 'b', 'c', 'd'])
    assert.throws(function () {
      parse(comb.splitEnd(core.token(), strs.string('.')), 'a.b.c.d')
    }, /expected end of input/)
  })
  it('accepts a flag to make the ender optional', function () {
    assert.deepEqual(
      parse(comb.splitEnd(core.token(), strs.string('.'),
      {enforceEnd: false}),
      'a.b.c.d'),
      ['a', 'b', 'c', 'd'])
    assert.deepEqual(
      parse(comb.splitEnd(core.token(), strs.string('.'),
      {enforceEnd: false}),
      'a.b.c.d.'),
      ['a', 'b', 'c', 'd'])
  })
  it('accepts a min count', function () {
    var parser = comb.splitEnd(core.token(), strs.string('.'), {min: 3})
    assert.deepEqual(parse(parser, 'a.b.c.'), ['a', 'b', 'c'])
    assert.throws(function () {
      parse(parser, 'a.b.')
    }, /unexpected eof/)

    parser = comb.splitEnd(core.token(), strs.string('.'),
    {min: 3, enforceEnd: false})
    assert.deepEqual(parse(parser, 'a.b.c.'), ['a', 'b', 'c'])
    assert.deepEqual(parse(parser, 'a.b.c'), ['a', 'b', 'c'])
  })
  it('accepts a max count', function () {
    var parser = comb.splitEnd(core.token(), strs.string('.'), {max: 3})
    assert.deepEqual(parse(comb.and(parser, strs.string('d.')), 'a.b.c.d.'),
    'd.')

    parser = comb.splitEnd(core.token(), strs.string('.'),
    {max: 3, enforceEnd: false})
    assert.deepEqual(parse(comb.and(parser, strs.string('d.')), 'a.b.c.d.'),
    'd.')
    assert.deepEqual(parse(comb.and(parser, strs.string('d.')), 'a.b.cd.'),
    'd.')
  })
})
