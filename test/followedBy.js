/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse
var reject = require('bluebird').reject

describe('followedBy()', function () {
  it('returns the first result if the others also succeed', function () {
    var parserSuccess = comb.followedBy(core.value('pass'),
                                        core.value('yay'))
    return parse(parserSuccess, '').then(function (res) {
      assert.equal(res, 'pass')
    })
  })
  it('fails if the follower parsers fail', function () {
    var parserFail1 = comb.followedBy(core.value('pass'), core.fail('nope'))
    var parserFail2 = comb.followedBy(
      core.value('pass'),
      core.value('pass'),
      core.fail('nope'))
    return parse(parserFail1, '').then(reject, function (e) {
      assert.match(e.message, /nope/)
    }).then(function () {
      return parse(parserFail2, '')
    }).then(reject, function (e) {
      assert.match(e.message, /nope/)
    })
  })
  it('fails if the first parser fails', function () {
    var parserFail = comb.followedBy(core.fail('nope'), core.value('pass'))
    return parse(parserFail, '').then(reject, function (e) {
      assert.match(e.message, /nope/)
    })
  })
})
