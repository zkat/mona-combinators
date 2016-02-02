import {
  bind,
  fail,
  label,
  token,
  value
} from '@mona/core'

/**
 * Parser combinators for higher-order interaction between parsers.
 *
 * @module mona/combinators
 */

/**
 * Returns a parser that succeeds if all the parsers given to it succeed. The
 * returned parser uses the value of the last successful parser.
 *
 * @param {...Parser} parsers - One or more parsers to execute.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(and(token(), token()), 'ab') // => 'b'
 */
export function and (firstParser, ...moreParsers) {
  if (!firstParser) {
    throw new Error('and() requires at least one parser')
  }
  return parserState => {
    return parserState.parse(firstParser).then(res => {
      return (res.failed || !moreParsers.length)
      ? res
      : res.parse(and(...moreParsers))
    })
  }
}

/**
 * Returns a parser that succeeds if one of the parsers given to it
 * suceeds. Uses the value of the first successful parser.
 *
 * @param {...Parser} parsers - Zero or more parsers to execute.
 * @param {String} [label] - Label to replace the full message with.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(or(string('foo'), string('bar')), 'bar') // => 'bar'
 */
export function or (...parsers) {
  const labelMsg =
    typeof parsers[parsers.length - 1] === 'string' && parsers.pop()
  const p = parserState => {
    const parser = parsers.shift()
    return !parser ? parserState : parserState.parse(parser).then(s1 => {
      if (!s1.failed || !parsers.length) {
        return s1
      } else {
        return parserState.parse(or(...parsers)).then(s2 => {
          if (!s2.failed) {
            return s2
          } else {
            let nextState = s2.copy()
            nextState.error = s1.error.merge(s2.error)
            return nextState
          }
        })
      }
    })
  }
  return labelMsg ? label(p, labelMsg) : p
}

/**
 * Returns a parser that returns the result of `parser` if it succeeds,
 * otherwise succeeds with a value of `undefined` without consuming input.
 *
 * @param {Parser} parser - Parser to try.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(maybe(token()), '') // => undefined
 */
export function maybe (parser) {
  return or(parser, value())
}

/**
 * Returns a parser that succeeds if `parser` fails. Does not consume.
 *
 * @param {Parser} parser - parser to test.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(and(not(string('a')), token()), 'b') // => 'b'
 */
export function not (parser) {
  return parserState => parserState.parse(parser).then(res => {
    return parserState.parse(res.failed
      ? value(true)
      : fail('expected parser to fail', 'expectation'))
  })
}

/**
 * Returns a parser that works like `and`, but fails if the first parser given
 * to it succeeds. Like `and`, it returns the value of the last successful
 * parser.
 *
 * @param {Parser} notParser - If this parser succeeds, `unless` will fail.
 * @param {...Parser} moreParsers - Rest of the parses to test.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(unless(string('a'), token()), 'b') // => 'b'
 */
export function unless (parser, ...moreParsers) {
  return and(not(parser), ...moreParsers)
}

/**
 * Returns a parser that succeeds if all the parsers given to it succeed. The
 * returned parser uses the values of the all joined parsers.
 *
 * @param {...Parser} parsers - One or more parsers to execute.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(join(alpha(), integer()), 'a1') // => ['a', 1]
 */
export function join (parser, ...moreParsers) {
  return parserState => {
    return !parser
    ? parserState.parse(value([]))
    : parserState.parse(parser).then(s1 => {
      if (s1.failed) {
        return s1
      } else if (!moreParsers) {
        let nextState = s1.copy()
        nextState.value = [s1.value]
        return nextState
      } else {
        return s1.parse(join(...moreParsers)).then(s2 => {
          if (s2.failed) {
            return s2
          } else {
            let nextState = s2.copy()
            nextState.value = [s1.value].concat(s2.value)
            return nextState
          }
        })
      }
    })
  }
}

/**
 * Returns a parser that returns the result of its first parser if it succeeds,
 * but fails if any of the following parsers fail.
 *
 * @param {Parser} parser - The value of this parser is returned if it
 *                               succeeds.
 * @param {...Parser} moreParsers - These parsers must succeed in order for
 *                                       `followedBy` to succeed.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(followedBy(string('a'), string('b')), 'ab') // => 'a'
 */
export function followedBy (parser, ...moreParsers) {
  return bind(parser, result =>
    bind(and(...moreParsers), () => value(result)))
}

/**
 * Returns a parser that returns an array of results that have been successfully
 * parsed by `parser`, which were separated by `separator`.
 *
 * @param {Parser} parser - Parser for matching and collecting results.
 * @param {Parser} separator - Parser for the separator
 * @param {Object} [opts]
 * @param {Integer} [opts.min=0] - Minimum length of the resulting array.
 * @param {Integer} [opts.max=0] - Maximum length of the resulting array.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(split(token(), space()), 'a b c d') // => ['a','b','c','d']
 */
export function split (parser, separator, opts = {}) {
  if (!opts.min) {
    return or(split(parser, separator, {min: 1, max: opts.max}),
              value([]))
  } else {
    let newOpts = Object.create(opts)
    newOpts.min = opts.min && opts.min - 1
    newOpts.max = opts.max && opts.max - 1
    return bind(parser, x =>
      bind(collect(and(separator, parser), newOpts), xs =>
      value([x].concat(xs))))
  }
}

/**
 * Returns a parser that returns an array of results that have been successfully
 * parsed by `parser`, separated and ended by `separator`.
 *
 * @param {Parser} parser - Parser for matching and collecting results.
 * @param {Parser} separator - Parser for the separator
 * @param {Object} [opts]
 * @param {Integer} [opts.enforceEnd=true] - If true, `separator` must be at the
 *                                           end of the parse.
 * @param {Integer} [opts.min=0] - Minimum length of the resulting array.
 * @param {Integer} [opts.max=Infinity] - Maximum length of the resulting array.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(splitEnd(token(), space()), 'a b c ') // => ['a', 'b', 'c']
 */
export function splitEnd (parser, separator, opts = {}) {
  if ((opts.enforceEnd == null) || opts.enforceEnd) {
    return collect(followedBy(parser, separator), opts)
  } else {
    // TODO - This is bloody terrible and should die a horrible, painful death,
    //        but at least the tests seem to pass. :\
    const min = opts.min || 0
    const max = opts.max || Infinity
    return bind(splitEnd(parser, separator, {
      min: opts.min && min - 1,
      max: opts.max && max - 1
    }), results => {
      if (opts.min > results.length || opts.max > 0) {
        return bind(followedBy(parser, maybe(separator)),
        last => value(results.concat([last])))
      } else {
        return bind(maybe(parser),
        last => value(last ? results.concat([last]) : results))
      }
    })
  }
}

/**
 * Returns a parser that results in an array of `min` to `max` matches of
 * `parser`
 *
 * @param {Parser} parser - Parser to match.
 * @param {Object} [opts]
 * @param {Integer} [opts.min=0] - Minimum number of matches.
 * @param {Integer} [opts.max=Infinity] - Maximum number of matches.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(collect(token()), 'abcd') // => ['a', 'b', 'c', 'd']
 */
export function collect (parser, opts = {}) {
  const min = opts.min || 0
  const max = typeof opts.max === 'undefined' ? Infinity : opts.max
  if (min > max) {
    throw new Error('min must be less than or equal to max')
  }
  return parserState => {
    return parserState.parse(parser).then(s => {
      if (s.failed && !min) {
        let nextState = parserState.copy()
        nextState.value = []
        return nextState
      } else if (s.failed && min) {
        return s
      } else if (!s.failed && max <= 1) {
        let nextState = s.copy()
        nextState.value = [s.value]
        return nextState
      } else {
        let newOpts = Object.create(opts)
        newOpts.max > 0 && newOpts.max--
        newOpts.min > 0 && newOpts.min--
        return s.parse(collect(parser, newOpts)).then(s2 => {
          if (s2.failed && min) {
            return s2
          } else {
            let nextState = s2.failed ? s.copy() : s2.copy()
            nextState.value = s2.failed
            ? [s.value]
            : [s.value].concat(s2.value)
            return nextState
          }
        })
      }
    })
  }
}

/**
 * Returns a parser that results in an array of exactly `n` results for
 * `parser`.
 *
 * @param {Parser} parser - The parser to collect results for.
 * @param {Integer} n - exact number of results to collect.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(exactly(token(), 4), 'abcd') // => ['a', 'b', 'c', 'd']
 */
export function exactly (parser, n) {
  return collect(parser, {min: n, max: n})
}

/**
 * Returns a parser that results in a value between an opening and closing
 * parser.
 *
 * @param {Parser} open - Opening parser.
 * @param {Parser} close - Closing parser.
 * @param {Parser} parser - Parser to return the value of.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(between(string('('), string(')'), token()), '(a)') // => 'a'
 */
export function between (open, close, parser) {
  return and(open, followedBy(parser, close))
}

/**
 * Returns a parser that skips input until `parser` stops matching.
 *
 * @param {Parser} parser - Determines whether to continue skipping.
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(and(skip(string('a')), token()), 'aaaab') // => 'b'
 */
export function skip (parser) {
  return and(collect(parser), value())
}

/**
 * Returns a parser that accepts a parser if its result is within range of
 * `start` and `end`.
 *
 * @param {*} start - lower bound of the range to accept.
 * @param {*} end - higher bound of the range to accept.
 * @param {Parser} [parser=token()] - parser whose results to test
 * @param {Function} [predicate=function(x,y){return x<=y }] - Tests range
 * @memberof module:mona/combinators
 * @instance
 *
 * @example
 * parse(range('a', 'z'), 'd') // => 'd'
 */
export function range (start, end, parser = token(), predicate = (x, y) => x <= y) {
  return label(bind(parser, result =>
    (predicate(start, result) && predicate(result, end))
    ? value(result)
    : fail()),
  `value between {${start}} and {${end}}`)
}
