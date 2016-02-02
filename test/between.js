/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse
var reject = require('bluebird').reject
var tok = function (x) {
  return core.label(core.is(function (v) {
    return x === v
  }), '{' + x + '}')
}

describe('between()', function () {
  it('returns a value in between two other parsers', function () {
    var parser = comb.between(tok('('), tok(')'), tok('a'))
    return parse(parser, '(a)').then(function (res) {
      assert.equal(res, 'a')
    }).then(function () {
      return parse(parser, 'a)')
    }).then(reject, function (e) {
      assert.match(e.message, /expected \{\(\}/)
    }).then(function () {
      return parse(parser, '(a')
    }).then(reject, function (e) {
      assert.match(e.message, /expected \{\)\}/)
    }).then(function () {
      return parse(parser, '()')
    }).then(reject, function (e) {
      assert.match(e.message, /expected \{a\}/)
    })
  })
})
