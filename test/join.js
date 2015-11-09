/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var nums = require('@mona/numbers')
var strs = require('@mona/strings')
var parse = require('@mona/parse')

describe('join()', function () {
  it('returns the results as an array if all parsers succeed', function () {
    assert.deepEqual(parse(comb.join(strs.alpha(), nums.integer()), 'a1'),
                     ['a', 1])
    assert.deepEqual(parse(comb.join(core.token()), 'a'), ['a'])
    assert.throws(function () {
      parse(comb.join(), 'ab')
    }, /requires at least one parser/)
  })
})
