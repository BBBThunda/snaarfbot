/** Unit tests for the SnaarfBot class */

/* eslint no-unused-expressions: "off" -- We're only testing mock methods called when testing functions that don't return a value */
/* eslint no-new: "off" -- We're only testing mock methods called when testing functions that don't return a value */

const Poll = require('../Poll')
const CONSTANTS = require('../constants')

const TEST_TARGET = 'AwesomeChannel'
const TEST_USER = 'genericUser1234'
const TEST_DESCRIPTION = 'What is your favorite color?'
const TEST_OPTIONS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'indigo',
  'violet',
]
const TEST_LENGTH = 240
const TEST_INVALID_TARGET = 123
const TEST_INVALID_USER = 456
const TEST_INVALID_DESCRIPTION = ''
const TEST_INVALID_OPTIONS_NOT_ARRAY = 'red yellow blue'
const TEST_INVALID_OPTIONS_NOT_ENOUGH = ['rainbow']
const TEST_INVALID_OPTIONS_CONTAINS_NON_STRINGS = [1, 'red']
const TEST_INVALID_LENGTH = 'not_numeric'

describe('Constructor and Parameter Validation', () => {
  test('should validate valid inputs', () => {
    expect(
      Poll.validateConstructorParams(
        TEST_TARGET,
        TEST_USER,
        TEST_DESCRIPTION,
        TEST_OPTIONS,
        TEST_LENGTH
      )
    ).toBe('')
  })

  test('should create a valid object with valid inputs', () => {
    const testPoll = new Poll(
      TEST_TARGET,
      TEST_USER,
      TEST_DESCRIPTION,
      TEST_OPTIONS,
      TEST_LENGTH
    )
    expect(testPoll.target).toBe(TEST_TARGET)
    expect(testPoll.creator).toBe(TEST_USER)
    expect(testPoll.description).toBe(TEST_DESCRIPTION)
    expect(testPoll.options).toBe(TEST_OPTIONS)
    expect(testPoll.end).toBe(
      testPoll.start + TEST_LENGTH * CONSTANTS.MS_PER_MIN
    )
  })

  test('should fail with invalid target', () => {
    expect(
      Poll.validateConstructorParams(
        TEST_INVALID_TARGET,
        TEST_USER,
        TEST_DESCRIPTION,
        TEST_OPTIONS,
        TEST_LENGTH
      )
    ).not.toBe('')
  })

  test('should fail with invalid user', () => {
    expect(
      Poll.validateConstructorParams(
        TEST_TARGET,
        TEST_INVALID_USER,
        TEST_DESCRIPTION,
        TEST_OPTIONS,
        TEST_LENGTH
      )
    ).not.toBe('')
  })

  test('should fail with invalid description', () => {
    expect(
      Poll.validateConstructorParams(
        TEST_TARGET,
        TEST_USER,
        TEST_INVALID_DESCRIPTION,
        TEST_OPTIONS,
        TEST_LENGTH
      )
    ).not.toBe('')
  })

  test('should fail if options is not array', () => {
    expect(
      Poll.validateConstructorParams(
        TEST_TARGET,
        TEST_USER,
        TEST_DESCRIPTION,
        TEST_INVALID_OPTIONS_NOT_ARRAY,
        TEST_LENGTH
      )
    ).not.toBe('')
  })

  test('should fail with too few options', () => {
    expect(
      Poll.validateConstructorParams(
        TEST_TARGET,
        TEST_USER,
        TEST_DESCRIPTION,
        TEST_INVALID_OPTIONS_NOT_ENOUGH,
        TEST_LENGTH
      )
    ).not.toBe('')
  })

  test('should fail with a non-string option', () => {
    expect(
      Poll.validateConstructorParams(
        TEST_TARGET,
        TEST_USER,
        TEST_DESCRIPTION,
        TEST_INVALID_OPTIONS_CONTAINS_NON_STRINGS,
        TEST_LENGTH
      )
    ).not.toBe('')
  })

  test('should fail with invalid length', () => {
    expect(
      Poll.validateConstructorParams(
        TEST_TARGET,
        TEST_USER,
        TEST_DESCRIPTION,
        TEST_OPTIONS,
        TEST_INVALID_LENGTH
      )
    ).not.toBe('')
  })
})
