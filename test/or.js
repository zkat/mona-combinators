/* global describe, it */
var assert = require('assert')
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
    })
  })
  it('reports all the accumulated errors', function () {
    var parser = comb.or(core.fail('foo'),
                         core.fail('bar'),
                         core.fail('baz'),
                         core.fail('quux'))
    return parse(parser, '').then(reject, function (e) {
      assert.ok(/\(line 1, column 0\) foo\nbar\nbaz\nquux/.test(e.message))
    })
  })
  it('accumulates labeled errors without clobbering', function () {
    var parser = comb.or(core.label(core.fail(), 'foo'),
                         core.label(core.fail(), 'bar'),
                         core.label(core.fail(), 'baz'))
    return parse(parser, '').then(reject, function (e) {
      assert.ok(
        /\(line 1, column 0\) expected foo\nexpected bar\nexpected baz/.test(e.message))
    })
  })
  it('accumulates errors with the greatest identical position', function () {
    var parser = comb.or(core.fail('foo'),
                         core.is(function (x) {
                           return x === 'ad'
                         }, core.token(2)),
                         core.is(function (x) {
                           return x === 'abc'
                         }, core.token(3)),
                         core.is(function (x) {
                           return x === 'abcd'
                         }, core.token(4)))
    return parse(parser, 'abd').then(reject, function (e) {
      console.log(e.message)
      assert.ok(/column 3\) [^\{]+{abc}\n[^\{]+{abcd}/.test(e.message))
    })
  })
  // it('labels the parser if the last argument is a string', function () {
  //   var parser = comb.or(core.fail('foo'),
  //                        core.fail('bar'),
  //                        core.fail('baz'),
  //                        core.fail('quux'),
  //                        'one of many things')
  //   assert.throws(function () {
  //     parse(parser, '')
  //   }, /\(line 1, column 0\) expected one of many things/)
  // })
})
