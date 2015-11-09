/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse')

describe('maybe()', function () {
  it('returns the result of the parser, if it succeeds', function () {
    assert.equal(parse(comb.maybe(core.value('foo')), ''), 'foo')
  })
  it('returns undefined without consuming if the parser fails', function () {
    assert.equal(parse(comb.maybe(core.fail('nope')), ''), undefined)
    assert.equal(parse(comb.and(comb.maybe(core.fail('nope')),
                                core.token()),
                       'a'),
                 'a')
  })
})
