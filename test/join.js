/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse

describe('join()', function () {
  it('returns the results as an array if all parsers succeed', function () {
    var parser = comb.join(core.value('foo'), core.value('bar'))
    return parse(parser, '').then(function (res) {
      assert.deepEqual(res, ['foo', 'bar'])
    }).then(function () {
      return parse(comb.join(core.value('foo')), '')
    }).then(function (res) {
      assert.deepEqual(res, ['foo'])
    })
  })
  it('returns an empty array if no parsers are provided', function () {
    return parse(comb.join(), '').then(function (res) {
      assert.deepEqual(res, [])
    })
  })
})
