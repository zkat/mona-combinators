/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse
var reject = require('bluebird').reject
var dot = core.is(function (x) { return x === '.' })

describe('splitEnd()', function () {
  it('collects matches separated and ended by a parser', function () {
    var parser = comb.splitEnd(core.token(), dot)
    return parse(parser, 'a.b.c.d.').then(function (res) {
      assert.deepEqual(res, ['a', 'b', 'c', 'd'])
    }).then(function () {
      return parse(comb.splitEnd(core.token(), dot), 'a.b.c.d')
    }).then(reject, function (e) {
      assert.match(e.message, /expected end of input/)
    })
  })
  it('accepts a flag to make the ender optional', function () {
    return parse(
      comb.splitEnd(core.token(), dot, {enforceEnd: false}),
      'a.b.c.d'
    ).then(function (res) {
      assert.deepEqual(res, ['a', 'b', 'c', 'd'])
    }).then(function () {
      return parse(
        comb.splitEnd(core.token(), dot, {enforceEnd: false}),
        'a.b.c.d.')
    }).then(function (res) {
      assert.deepEqual(res, ['a', 'b', 'c', 'd'])
    })
  })
  it('accepts a min count', function () {
    var parser = comb.splitEnd(core.token(), dot, {min: 3})
    return parse(parser, 'a.b.c.').then(function (res) {
      assert.deepEqual(res, ['a', 'b', 'c'])
    }).then(function () {
      return parse(parser, 'a.b.')
    }).then(reject, function (e) {
      assert.match(e.message, /unexpected eof/)
    })
  })
  it('accepts a min count combined with enforceEnd', function () {
    var parser = comb.splitEnd(core.token(), dot, {min: 3, enforceEnd: false})
    return parse(parser, 'a.b.c.').then(function (res) {
      assert.deepEqual(res, ['a', 'b', 'c'])
    }).then(function () {
      return parse(parser, 'a.b.c')
    }).then(function (res) {
      assert.deepEqual(res, ['a', 'b', 'c'])
    })
  })
  it('accepts a max count', function () {
    var parser = comb.splitEnd(core.token(), dot, {max: 3})
    return parse(
      comb.and(parser, core.token(), dot),
      'a.b.c.d.'
    ).then(function (res) {
      assert.equal(res, '.')
    })
  })
  it('accepts a max count combined with enforceEnd', function () {
    var parser = comb.splitEnd(core.token(), dot, {
      max: 3,
      enforceEnd: false
    })
    return parse(
      comb.and(parser, core.token(), dot),
      'a.b.c.d.'
    ).then(function (res) {
      assert.equal(res, '.')
    }).then(function () {
      return parse(comb.and(parser, core.token(), dot), 'a.b.cd.')
    }).then(function (res) {
      assert.equal(res, '.')
    })
  })
})
