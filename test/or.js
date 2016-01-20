/* global describe, it */
var assert = require('chai').assert
var comb = require('..')
var core = require('@mona/core')
var parse = core.parse
var reject = require('bluebird').reject

describe('or()', function () {
  it('returns the result of the first parser that succeeds', function () {
    var parser = comb.or(core.value('foo'), core.value('bar'))
    return parse(parser, '').then(function (res) {
      assert.equal(res, 'foo')
    }).then(function () {
      var parser = comb.or(core.fail('nope'), core.value('yup'))
      return parse(parser, '')
    }).then(function (res) {
      assert.equal(res, 'yup')
    }).then(function () {
      var parser = comb.or(core.token(), core.value('yay'))
      return parse(parser, '')
    }).then(function (res) {
      assert.equal(res, 'yay')
    })
  })
  it('reports all the accumulated errors', function () {
    var parser = comb.or(core.fail('foo'),
                         core.fail('bar'),
                         core.fail('baz'),
                         core.fail('quux'))
    return parse(parser, '').then(reject, function (e) {
      assert.match(e.message, /\(line 1, column 0\) foo\nbar\nbaz\nquux/)
    })
  })
  it('accumulates labeled errors without clobbering', function () {
    var parser = comb.or(core.label(core.fail(), 'foo'),
                         core.label(core.fail(), 'bar'),
                         core.label(core.fail(), 'baz'))
    return parse(parser, '').then(reject, function (e) {
      assert.match(e.message,
        /\(line 1, column 0\) expected foo\nexpected bar\nexpected baz/)
    })
  })
  it('accumulates errors with the greatest identical position', function () {
    var parser = comb.or(core.fail('foo'),
                         core.is(function (x) {
                           return x === 'ad'
                         }, core.token(2)),
                         core.label(core.is(function (x) {
                           return x === 'abc'
                         }, core.token(3)), '{abc}'),
                         core.label(core.is(function (x) {
                           return x === 'abb'
                         }, core.token(3)), '{abb}'))
    return parse(parser, 'abd').then(reject, function (e) {
      assert.match(e.message, /column 3\) [^\{]+{abc}\n[^\{]+{abb}/)
    })
  })
  it('labels the parser if the last argument is a string', function () {
    var parser = comb.or(core.fail('foo'),
                         core.fail('bar'),
                         core.fail('baz'),
                         core.fail('quux'),
                         'one of many things')
    return parse(parser, '').then(reject, function (e) {
      assert.match(e.message, /\(line 1, column 0\) expected one of many things/)
    })
  })
})
