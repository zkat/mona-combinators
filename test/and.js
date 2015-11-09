/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse').parse

describe('and()', function () {
  it('returns the last result if all previous ones succeed', function () {
    assert.equal(parse(comb.and(core.token(), core.token()), 'ab'), 'b')
    assert.equal(parse(comb.and(core.token()), 'a'), 'a')
    assert.throws(function () {
      parse(comb.and(), 'ab')
    }, /requires at least one parser/)
  })
})
