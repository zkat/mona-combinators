/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse
var reject = require('bluebird').reject

describe('collect()', function () {
  it('collects zero or more matches by default', function () {
    var parser = comb.collect(core.token())
    return parse(parser, 'abc').then(function (res) {
      assert.deepEqual(res, ['a', 'b', 'c'])
    }).then(function () {
      return parse(core.bind(comb.collect(core.is(function (x) {
        return x === 'a'
      })), function (res) {
        return core.bind(core.token(), function () {
          return core.value(res)
        })
      }), 'aaab')
    }).then(function (res) {
      assert.deepEqual(res, ['a', 'a', 'a'])
    })
  })
  it('succeeds even if no matches are found', function () {
    var parser = comb.collect(core.token())
    return parse(parser, '').then(function (res) {
      assert.deepEqual(res, [])
    })
  })
  it('accepts a minimum count', function () {
    var parser = comb.collect(core.token(), {min: 2})
    return parse(parser, 'aa').then(function (res) {
      assert.deepEqual(res, ['a', 'a'])
    }).then(function () {
      return parse(parser, 'aaa')
    }).then(function (res) {
      assert.deepEqual(res, ['a', 'a', 'a'])
    }).then(function () {
      return parse(parser, 'a')
    }).then(reject, function (e) {
      assert.match(e.message, /unexpected eof/)
    })
  })
  it('accepts a maximum count', function () {
    var parser = comb.followedBy(
      comb.collect(core.token(), {min: 1, max: 4}),
      comb.collect(core.token()))
    return parse(parser, 'aaaaa').then(function (res) {
      assert.deepEqual(res, ['a', 'a', 'a', 'a'])
    })
  })
})
