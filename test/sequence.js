/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse')

describe('sequence()', function () {
  it('simulates do notation', function () {
    var parser = comb.sequence(function (s) {
      var x = s(core.token())
      assert.equal(x, 'a')
      var y = s(core.token())
      assert.equal(y, 'b')
      return core.value(y + x)
    })
    assert.equal(parse(parser, 'ab'), 'ba')
  })
  it('errors with the correct message if a parser fails', function () {
    assert.throws(function () {
      var parser = comb.sequence(function (s) {
        var x = s(core.token())
        assert.equal(x, 'a')
        return core.token()
      })
      parse(parser, 'a')
    }, /\(line 1, column 2\) unexpected eof/)
    assert.throws(function () {
      var parser = comb.sequence(function (s) {
        s(core.token())
        s(core.token())
        s(core.token())
        return core.eof()
      })
      parse(parser, 'aa')
    }, /\(line 1, column 3\) unexpected eof/)
  })
  it('throws an error if callback fails to return a parser', function () {
    assert.throws(function () {
      parse(comb.sequence(function () { return 'nope' }), '')
    }, /must return a parser/)
    assert.throws(function () {
      parse(comb.sequence(function () { return function () {} }), '')
    }, /must return a parser/)
  })
})
