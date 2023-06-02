/** Unit tests for the SnaarfBot class */

/* eslint no-unused-expressions: "off" -- We're only testing mock methods called when testing functions that don't return a value */
/* eslint no-new: "off" -- We're only testing mock methods called when testing functions that don't return a value */

const SnaarfBot = require('../snaarfBot')
const logger = require('../logger')
const client = require('../tmi')

// Convert objects into mocks
jest.mock('../logger')
jest.mock('../tmi')

const CONSTANTS = { DEFAULT_DIE_SIDES: 6 }

afterEach(() => {
  jest.clearAllMocks()
})

describe('Constructor', () => {
  test('should connect on create', () => {
    new SnaarfBot(logger, CONSTANTS, client)
    expect(client.connect).toHaveBeenCalled()
  })

  test('should bind event handlers on create', () => {
    const bot = new SnaarfBot(logger, CONSTANTS, client)
    expect(client.on).toHaveBeenCalledWith('connected', bot.onConnectedHandler)
    expect(client.on).toHaveBeenCalledWith('message', bot.onMessageHandler)
  })
})

describe('connected handler', () => {
  const TEST_ADDRESS = 'twitch.irc.address'
  const TEST_PORT = 123
  const bot = new SnaarfBot(logger, CONSTANTS, client)

  test('should log message on connect', () => {
    bot.onConnectedHandler(TEST_ADDRESS, TEST_PORT)
    expect(logger.info).toHaveBeenCalledWith(
      `* Connected to ${TEST_ADDRESS}:${TEST_PORT}`
    )
  })
})

describe('message handler', () => {
  const TEST_TARGET = 'BBBThunda'
  const TEST_CONTEXT = {}
  const TEST_MESSAGE = 'Generic non-command message'
  const TEST_IS_ME = false
  const bot = new SnaarfBot(logger, CONSTANTS, client)

  test('should ignore own messages', () => {
    const isMe = true
    bot.onMessageHandler(TEST_TARGET, TEST_CONTEXT, TEST_MESSAGE, isMe)
    expect(logger.info).toHaveBeenCalledTimes(0)
    expect(logger.warn).toHaveBeenCalledTimes(0)
    expect(logger.error).toHaveBeenCalledTimes(0)
    expect(logger.debug).toHaveBeenCalledTimes(0)
    expect(logger.verbose).toHaveBeenCalledTimes(0)
  })

  test('should ignore non-commands', () => {
    const message = 'HYPEEEE!!!'
    bot.onMessageHandler(TEST_TARGET, TEST_CONTEXT, message, TEST_IS_ME)
    expect(logger.info).toHaveBeenCalledTimes(0)
    expect(logger.warn).toHaveBeenCalledTimes(0)
    expect(logger.error).toHaveBeenCalledTimes(0)
    expect(logger.debug).toHaveBeenCalledTimes(0)
    expect(logger.verbose).toHaveBeenCalledTimes(0)
  })

  test('dice command should result in bot message', () => {
    const message = '!dice'
    bot.onMessageHandler(TEST_TARGET, TEST_CONTEXT, message, TEST_IS_ME)
    expect(logger.info).toHaveBeenCalledWith(
      `* Executed dice command in ${TEST_TARGET}`
    )
    expect(client.say).toHaveBeenCalled()
  })

  test('invalid command should result in warning log', () => {
    const message = '!someInvalidCommand'
    bot.onMessageHandler(TEST_TARGET, TEST_CONTEXT, message, TEST_IS_ME)
    expect(logger.warn).toHaveBeenCalled()
  })
})

describe('getDiceRoll method', () => {
  const TEST_TARGET = 'AwesomeChannel'
  const TEST_CONTEXT = { 'display-name': 'genericUser1234' }
  const TEST_ARGS = []
  const bot = new SnaarfBot(logger, CONSTANTS, client)

  test('with no args results in info log and bot message', () => {
    bot.getDiceRoll(TEST_TARGET, TEST_CONTEXT, TEST_ARGS)
    expect(logger.info).toHaveBeenCalled
    expect(client.say).toHaveBeenCalled
  })

  test('with 1 side results in info log and bot message with 1', () => {
    const args = ['1']
    bot.getDiceRoll(TEST_TARGET, TEST_CONTEXT, args)
    expect(logger.info).toHaveBeenCalled
    expect(client.say).toHaveBeenCalledWith(
      TEST_TARGET,
      `@genericUser1234 rolled a 1, Schneeyarrrf!`
    )
  })

  test('invalid # of sides results in info log and bot message', () => {
    const args = ['abc']
    bot.getDiceRoll(TEST_TARGET, TEST_CONTEXT, args)
    expect(logger.info).toHaveBeenCalled
    expect(client.say).toHaveBeenCalled
  })
})

describe('rollDie method', () => {
  const bot = new SnaarfBot(logger, CONSTANTS, client)

  test('with null results in 1-6', () => {
    expect(bot.rollDie(null).toString()).toMatch(/[123456]/)
  })

  test('with 1 results in 1', () => {
    expect(bot.rollDie(1)).toBe(1)
  })

  test('with null results in 1-6', () => {
    const botWithoutDefault = new SnaarfBot(logger, CONSTANTS, client)
    expect(botWithoutDefault.rollDie(null).toString()).toMatch(/[123456]/)
  })
})
