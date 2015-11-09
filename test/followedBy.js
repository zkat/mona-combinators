/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse').parse

describe('followedBy()', function () {
  it('returns the first result if the others also succeed', function () {
    var parserSuccess = comb.followedBy(core.value('pass'),
                                        core.value('yay'))
    assert.equal(parse(parserSuccess, ''), 'pass')
    var parserFail = comb.followedBy(core.value('pass'),
                                     core.fail('nope'))
    assert.equal(parse(comb.or(parserFail, core.value('fail')), ''),
                 'fail')
  })
})
