/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse

describe('maybe()', function () {
  it('returns the result of the parser, if it succeeds', function () {
    return parse(
      comb.maybe(core.value('foo')),
      ''
    ).then(function (res) {
      assert.equal(res, 'foo')
    }).then(function () {
      return parse(comb.maybe(core.token()), '')
    }).then(function () {
      assert.ok(true)
    })
  })
  it('returns undefined without consuming if the parser fails', function () {
    return parse(comb.maybe(core.fail('nope')), '').then(function (res) {
      assert.equal(res, undefined)
    }).then(function () {
      return parse(comb.and(comb.maybe(core.fail('nope')), core.token()), 'a')
    }).then(function (res) {
      assert.equal(res, 'a')
    })
  })
})
