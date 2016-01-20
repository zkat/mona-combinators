/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse
var reject = require('bluebird').reject

describe('split()', function () {
  it('returns an array of values separated by a separator', function () {
    var parser = comb.split(core.token(), core.token())
    return parse(parser, 'a.b.c.d').then(function (res) {
      assert.deepEqual(res, ['a', 'b', 'c', 'd'])
    })
  })
  it('returns an empty array if it fails', function () {
    var parser = comb.split(core.token(), core.token())
    return parse(parser, '').then(function (res) {
      assert.deepEqual(res, [])
    })
  })
  it('accepts a min count', function () {
    var parser = comb.split(core.token(), core.token(), {min: 3})
    return parse(parser, 'a.b.c').then(function (res) {
      assert.deepEqual(res, ['a', 'b', 'c'])
    }).then(function () {
      return parse(parser, 'a.b')
    }).then(reject, function (e) {
      assert.match(
        e.message,
        /\(line 1, column 4\) unexpected eof/)
    })
  })
  it('accepts a max count', function () {
    var parser = comb.split(core.token(), core.token(), {max: 3})
    return parse(
      comb.and(parser, core.token(), core.token()),
      'a.b.c.d'
    ).then(function (res) {
      assert.deepEqual(res, 'd')
    })
  })
})
