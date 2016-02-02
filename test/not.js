/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse
var reject = require('bluebird').reject

describe('not()', function () {
  it('returns true if the given parser fails', function () {
    return parse(comb.not(core.token()), '').then(function (res) {
      assert.equal(res, true)
    })
  })
  it('fails if the given parser succeeds', function () {
    return parse(comb.not(core.value('foo')), '').then(reject, function (e) {
      assert.match(e.message, /expected parser to fail/)
    })
  })
})
