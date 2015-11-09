/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse').parse
var strings = require('@mona/strings')
var numbers = require('@mona/numbers')

describe('between()', function () {
  it('returns a value in between two other parsers', function () {
    var parser = comb.between(strings.string('('),
                              strings.string(')'),
                              numbers.integer())
    assert.equal(parse(parser, '(123)'), 123)
    assert.throws(function () {
      parse(parser, '123)')
    }, /expected string matching \{\(\}/)
    assert.throws(function () {
      parse(parser, '(123')
    }, /expected string matching \{\)\}/)
    assert.throws(function () {
      parse(parser, '()')
    }, /expected digit/)
    var maybeParser = comb.between(strings.string('('),
                                   strings.string(')'),
                                   core.maybe(numbers.integer()))
    assert.equal(parse(maybeParser, '()'), undefined)
  })
})
