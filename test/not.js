/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse')

describe('not()', function () {
  it('returns true if the given parser fails', function () {
    assert.equal(parse(comb.not(core.token()), ''), true)
  })
  it('fails if the given parser succeeds', function () {
    assert.throws(function () {
      parse(comb.not(core.value('foo')), '')
    }, /expected parser to fail/)
  })
})
