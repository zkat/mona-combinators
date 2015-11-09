/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse').parse
var strs = require('@mona/strings')

describe('skip()', function () {
  it('skips input until parser stops matching', function () {
    var parser = comb.and(comb.skip(strs.string('a')), core.token())
    assert.equal(parse(parser, 'aaaaaaaaaaab'), 'b')
  })
})
