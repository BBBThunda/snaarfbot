/** Contains the primary logic of the chat bot */
class SnaarfBot {
  /** @property {Object} client Twitch IRC Client created and initialized by tmi.js */
  client

  /** @property {Array} constants Global constants for the application */
  constants

  /** @property {Object} logger Logger client for handling/formatting system logs */
  logger

  /**
   * Create a bot object
   * @param {Object} logger    Fully configured logger client with methods like warn(), debug(), etc.
   * @param {Object} constants Hashmap with constant names and values
   * @param {Object} client    Twitch IRC client, such as tmi.js
   */
  constructor(logger, constants, client) {
    this.logger = logger
    this.constants = constants

    // Register our event handlers
    client.on('connected', this.onConnectedHandler)
    client.on('message', this.onMessageHandler)
    // client.on('cheer', this.onCheerHandler)
    // Connect to Twitch and cache the client
    client.connect()
    this.client = client
  }

  /**
   * Called every time the bot connects to Twitch chat ('connected' event triggered by client)
   * @param {string} addr The URI we connected to
   * @param {number} port The port we connected to
   */
  onConnectedHandler = (addr, port) => {
    this.logger.info(`* Connected to ${addr}:${port}`)
  }

  /**
   * Called every time a message is sent in the channel ('message' event triggered by client)
   *
   * @param {string} target  Target channel where message was sent
   * @param {Object} context Metadata about the message (sender, type, etc.)
   * @param {string} msg     The actual message text
   * @param {bool}   isMe    Whether the message was sent by this bot
   */
  onMessageHandler = (target, context, msg, isMe) => {
    // Ignore messages from the bot
    if (isMe) {
      return
    }

    // Useful context fields for reference (not used yet)
    // const chatUserId = context['user-id']
    // const chatUserName = context['display-name']

    const msgParts = msg.trim().split(' ')
    // Ignore messages that are not bot commands
    if (!msgParts[0] || msgParts[0].charAt(0) !== '!') {
      return
    }

    // If it's a command, parse it
    const args = msgParts.slice(1)
    const commandName = msgParts[0].substr(1, msgParts[0].length - 1)

    // If the command is known, let's execute it
    switch (commandName) {
      case 'dice':
        this.logger.debug(context)
        this.getDiceRoll(target, context, args)
        this.logger.info(`* Executed ${commandName} command in ${target}`)
        break
      default:
        this.logger.warn(`* Unknown command ${commandName}, ignored`)
    }
  }

  /**
   * Handle a dice command. Get input data, roll die, send bot message with result.
   *
   * @param {string}   target  Name of the channel where a message was sent
   * @param {Object}   context Additional metadata about the message
   * @param {string[]} args    Arguments typed after a command
   */
  getDiceRoll = (target, context, args) => {
    const sides = isNaN(args[0]) ? null : args[0] ?? null
    // @Username or You
    const prefixUsername = context['display-name']
      ? '@' + context['display-name']
      : 'You'
    const result = this.rollDie(sides)
    // Send message via bot user with result of command
    const message = `${prefixUsername} rolled a ${result}, Schneeyarrrf!`
    this.logger.info(message)
    this.client.say(target, message)
  }

  /**
   * Roll a die with a given number of sides and return the result
   *
   * @param {number} sides Number of sides of the die (default defined by constant or 6)
   *
   * @returns {number} Result of die roll.
   */
  rollDie = (sides) =>
    Math.floor(
      Math.random() * (sides ?? this.constants.DEFAULT_DIE_SIDES ?? 6)
    ) + 1

  // onCheerHandler = (target, context, message) => {}
}

module.exports = SnaarfBot
