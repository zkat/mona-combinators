/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse
var reject = require('bluebird').reject

describe('exactly()', function () {
  it('collects exactly n matches', function () {
    var parser = comb.exactly(core.is(function (x) {
      return x === 'a'
    }), 3)
    return parse(parser, 'aaa').then(function (res) {
      assert.deepEqual(res, ['a', 'a', 'a'])
    }).then(function () {
      return parse(parser, 'aa')
    }).then(reject, function (e) {
      assert.match(e.message, /unexpected eof/)
    }).then(function () {
      return parse(parser, 'aaaa')
    }).then(reject, function (e) {
      assert.match(e.message, /expected end of input/)
    })
  })
})
