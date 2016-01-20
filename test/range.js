/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse
var reject = require('bluebird').reject

describe('range()', function () {
  it('succeeds if a parser\'s value is within range', function () {
    return parse(comb.range('a', 'z'), 'm').then(function (res) {
      assert.equal(res, 'm')
    })
  })
  it('accepts a parser as a third argument', function () {
    var parser = comb.range(
      -5,
      -1,
      core.bind(core.token(), function (tok) {
        return core.value(-tok)
      }))
    return parse(parser, '3').then(function (res) {
      assert.equal(res, -3)
    })
  })
  it('fails if the predicate fails', function () {
    return parse(
      comb.range('a', 'c'),
      'd'
    ).then(reject, function (e) {
      assert.match(e.message, /value between \{a\} and \{c\}/)
    }).then(function () {
      return parse(comb.range('c', 'a'), 'b')
    }).then(reject, function (e) {
      assert.match(e.message, /value between \{c\} and \{a\}/)
    })
  })
  it('accepts a custom predicate', function () {
    var pred = function (x, y) { return x >= y }
    return parse(
      comb.range('c', 'a', core.token(), pred),
      'b'
    ).then(function (res) {
      assert.equal(res, 'b')
    })
  })
})
