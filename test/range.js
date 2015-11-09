/* global describe, it */
var assert = require('assert')
var comb = require('..')
var parse = require('@mona/parse').parse
var strs = require('@mona/strings')
var nums = require('@mona/numbers')

describe('range()', function () {
  it('succeeds if a parser\'s value is within range', function () {
    var parser = comb.range('a', 'z')
    assert.equal(parse(parser, 'm'), 'm')
  })
  it('accepts a parser as a third argument', function () {
    assert.equal(parse(comb.range('a', 'aaa', strs.text()), 'aa'), 'aa')
    assert.equal(parse(comb.range(10, 15, nums.integer()), '12'), 12)
  })
  it('fails if the predicate fails', function () {
    assert.throws(function () {
      parse(comb.range('a', 'c'), 'd')
    }, /value between \{a\} and \{c\}/)
    assert.throws(function () {
      parse(comb.range(1, 4, nums.integer()), '5')
    }, /value between \{1\} and \{4\}/)
  })
})
