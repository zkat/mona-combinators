/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse
var reject = require('bluebird').reject

describe('unless()', function () {
  it('returns the last result if the first parser fails', function () {
    var parser = comb.unless(core.fail('fail'), core.value('success'))
    return parse(parser, '').then(function (res) {
      assert.equal(res, 'success')
    })
  })
  it('fails if the first parser succeeds', function () {
    var parser = comb.unless(core.value('success'), core.value('fail'))
    return parse(parser, '').then(reject, function (e) {
      assert.match(e.message, /expected parser to fail/)
    })
  })
})
