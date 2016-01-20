/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse

describe('and()', function () {
  it('returns the last result if all previous ones succeed', function () {
    var parser = comb.and(core.token(), core.token())
    return parse(parser, 'ab').then(function (res) {
      assert.equal(res, 'b')
    })
  })
  it('returns the result of a single parser', function () {
    return parse(comb.and(core.token()), 'a').then(function (res) {
      assert.equal(res, 'a')
    })
  })
  it('errors immediately if no parsers are given', function () {
    assert.throws(function () {
      parse(comb.and(), 'ab')
    }, /requires at least one parser/)
  })
})
