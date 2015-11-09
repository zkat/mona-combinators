/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse')
var strs = require('@mona/strings')

describe('or()', function () {
  it('returns the result of the first parser that succeeds', function () {
    assert.equal(parse(comb.or(core.value('foo'), core.value('bar')), ''),
    'foo')
    assert.equal(parse(comb.or(core.fail('nope'), core.value('yup')), ''),
    'yup')
  })
  it('reports all the accumulated errors', function () {
    var parser = comb.or(core.fail('foo'),
                         core.fail('bar'),
                         core.fail('baz'),
                         core.fail('quux'))
    assert.throws(function () {
      parse(parser, '')
    }, /\(line 1, column 0\) foo\nbar\nbaz\nquux/)
  })
  it('accumulates labeled errors without clobbering', function () {
    var parser = comb.or(core.label(core.fail(), 'foo'),
                         core.label(core.fail(), 'bar'),
                         core.label(core.fail(), 'baz'))
    assert.throws(function () {
      parse(parser, '')
    }, /\(line 1, column 0\) expected foo\nexpected bar\nexpected baz/)
  })
  it('accumulates errors with the greatest identical position', function () {
    var parser = comb.or(core.fail('foo'),
                         strs.string('ad'),
                         strs.string('abc'),
                         strs.string('abcd'))
    assert.throws(function () {
      parse(parser, 'abd')
    }, /column 3\) [^\{]+{abc}\n[^\{]+{abcd}/)
  })
  it('labels the parser if the last argument is a string', function () {
    var parser = comb.or(core.fail('foo'),
                         core.fail('bar'),
                         core.fail('baz'),
                         core.fail('quux'),
                         'one of many things')
    assert.throws(function () {
      parse(parser, '')
    }, /\(line 1, column 0\) expected one of many things/)
  })
})
