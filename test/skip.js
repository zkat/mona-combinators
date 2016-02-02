/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse

describe('skip()', function () {
  it('skips input until parser stops matching', function () {
    var parser = core.bind(comb.skip(core.is(function (x) {
      return x === 'a'
    })), function () {
      return core.token()
    })
    return parse(parser, 'aaaaaaaaaaab').then(function (res) {
      assert.equal(res, 'b')
    }).then(function () {
      return parse(parser, 'c')
    }).then(function (res) {
      assert.equal(res, 'c')
    })
  })
})
