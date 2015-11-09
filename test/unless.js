/* global describe, it */
var assert = require('assert')
var comb = require('..')
var core = require('@mona/core')
var parse = require('@mona/parse')

describe('unless()', function () {
  it('returns the last result if the first parser fails', function () {
    assert.equal(parse(comb.unless(core.fail('fail'),
                                   core.value('success')),
                       ''),
                 'success')
    assert.throws(function () {
      parse(comb.unless(core.value('success'), core.value('fail')), '')
    }, /expected parser to fail/)
  })
})
