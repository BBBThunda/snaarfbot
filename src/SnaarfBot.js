const Poll = require('./Poll')
const Vote = require('./Vote')

/** Contains the primary logic of the chat bot */
module.exports = class SnaarfBot {
  /** @property {Object} client Twitch IRC Client created and initialized by tmi.js */
  client

  /** @property {Array} constants Global constants for the application */
  constants

  /** @property {Object} logger Logger client for handling/formatting system logs */
  logger

  /** @property {Poll[]} pollList Master list of polls cached in memory */
  pollList

  voteList

  /**
   * Create a bot object
   *
   * @param {Object} logger    Fully configured logger client with methods like warn(), debug(), etc.
   * @param {Object} constants Hashmap with constant names and values
   * @param {Object} client    Twitch IRC client, such as tmi.js
   */
  constructor(logger, constants, client) {
    this.logger = logger
    this.constants = constants
    this.pollList = []

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
   *
   * @param {string} addr The URI we connected to
   * @param {number} port The port we connected to
   */
  onConnectedHandler = (addr, port) => {
    this.logger.info(`* Connected to ${addr}:${port}`)
  }

  /**
   * Called every time a message is sent in the channel ('message' event triggered by client)
   *
   * @param {string} target  Target (channel) where message was sent
   * @param {Object} context Metadata about the message (sender, type, etc.)
   * @param {string} msg     The actual message text
   * @param {bool}   isMe    Whether the message was sent by this bot
   */
  onMessageHandler = (target, context, msg, isMe) => {
    // Ignore messages from the bot
    if (isMe) {
      return
    }

    // console.log(typeof context)
    // console.log(context)

    // Useful context fields for reference (not used yet)
    const chatUserId = context['user-id']
    // const chatUserName = context['display-name']
    const roles = this.getRoles(context)

    const msgParts = this.parseArguments(msg.trim())
    console.log('msg: ' + msg)
    console.log(msgParts)
    // Ignore messages that are not bot commands
    if (!msgParts[0] || msgParts[0].charAt(0) !== '!') {
      return
    }

    // If it's a command, parse it and force lowercase
    const args = msgParts.slice(1)
    const commandName = msgParts[0]
      .substr(1, msgParts[0].length - 1)
      .toLowerCase()

    // If the command is known, let's execute it
    // Keep the chat bot functionality here. Pull other functionality into separate methods
    switch (commandName) {
      case 'dice':
        this.logger.debug(context)
        this.getDiceRoll(target, context, args)
        this.logger.info(`* Executed ${commandName} command in ${target}`)
        break
      // Create a new Poll
      case 'createpoll': {
        if (!roles.broadcaster) {
          break
        }
        const [length, description, ...options] = args
        // console.log({length: length, description: description, options: options})
        const errorMessage = this.createPoll(
          target,
          chatUserId,
          description,
          options,
          length
        )
        const usage = `!createPoll <lengthInMinutes> "<description>" "<option1>" "<option2>" [option3...]`
        if (errorMessage !== '') {
          // Fail message
          this.logger.warn(
            `Failed to create Poll: ${errorMessage}  Message: ${msg}`
          )
          this.client.say(
            target,
            `Failed to create Poll: ${errorMessage}\nSyntax:\n${usage}`
          )
        } else {
          // Success message
          this.client.say(
            target,
            'Your poll has been created and will end in ' +
              length +
              ' minutes.\n' +
              'To vote, use command !vote.\n' +
              'To view the status, use command !sbPoll'
          )
        }
        this.logger.info(`* Executed ${commandName} command in ${target}`)
        break
      }
      case 'disablepoll':
        if (!roles.broadcaster) {
          break
        }
        this.disablePoll(target, chatUserId)
        this.logger.info(`* Executed ${commandName} command in ${target}`)
        break
      // Show status of the current poll
      case 'sbpoll': {
        const poll = this.getActivePoll(target)
        // console.log(poll)
        if (poll === null) {
          this.logger.info(`Can't show status - nonexistent poll.`)
          break
        }
        poll.updateStatus()
        let message = `Poll status: ${poll.status}\n
        ${poll.description}\n`
        poll.options.forEach((option) => {
          const votes = 1 // DEBUG!!! Get this from the correct place once vote command is implemented
          message += `${option}: ${votes} votes\n`
        })
        const timeRemaining = poll.getTimeRemaining()
        const hours = Math.floor(timeRemaining / 1000 / 60 / 60)
        const minutes = Math.floor(
          (timeRemaining / 1000 / 60 / 60 - hours) * 60
        )
        const seconds = Math.floor(
          ((timeRemaining / 1000 / 60 / 60 - hours) * 60 - minutes) * 60
        )
        message += `Poll ends in`
        message += hours > 0 ? ` ${hours} hrs` : ``
        message += minutes > 0 ? ` ${minutes} min` : ``
        message += seconds > 0 ? ` ${seconds} sec` : ``
        this.client.say(target, message)
        this.logger.info(`* Executed ${commandName} command in ${target}`)
        break
      }
      // Choose the poll option to which your votes will go
      case 'vote':
        this.submitVote(target, chatUserId, args[0] || null)
        this.logger.info(`* Executed ${commandName} command in ${target}`)
        break
      default:
        this.logger.warn(`* Unknown command ${commandName}, ignored`)
    }
  }

  /**
   * Get the role badges from IRC context and put them in a nice object without
   *  missing fields
   *
   * @param {Object} context The context object returned by TMI.js
   * @returns {Object}
   */
  getRoles(context) {
    if (!context.badges) {
      return {
        broadcaster: false,
        moderator: false,
        vip: false,
      }
    }
    return {
      broadcaster: context.badges.broadcaster === '1',
      moderator: context.badges.moderator === '1',
      vip: context.badges.vip === '1',
    }
  }

  submitVote(target, user, option) {
    const poll = this.getActivePoll(target)
    option = parseInt(option)
    const errorMessage = Vote.validateConstructorParams(poll, user, option)
    if (errorMessage !== '') {
      // Return something
    }
    // const vote = new Vote(user, option)
    // Add the vote to the poll and check for errors
    // LEFT OFF HERE!!!!!!!!!!!!!!
    // poll.addVote
  }

  /**
   * Create a new poll and add it to the list
   *
   * @param   {String}   target      Target (channel) from which the request was initiated
   * @param   {String}   user        User ID of the person who made the request
   * @param   {String}   description The description of the poll, a.k.a. what we're voting on
   * @param   {String[]} options     The options from which you can choose when you vote
   * @param   {Number}   length      Length (in minutes) of this poll
   * @returns {String}   Error message on failure, empty string on success
   */
  createPoll(target, user, description, options, length) {
    if (this.getActivePoll(target) !== null) {
      return 'An active poll already exists for this channel.'
    }
    const errorMessage = Poll.validateConstructorParams(
      target,
      user,
      description,
      options,
      parseInt(length)
    )
    if (errorMessage) {
      return errorMessage
    }
    const poll = new Poll(target, user, description, options, length)
    this.pollList[target] = poll
    // console.log(this.pollList)
    return ''
  }

  /**
   * Disable/deactivate a Poll
   *
   * @param   {String} target Target (channel) whose poll we are disabling
   * @param   {String} user User who initiated the command to disable
   * @returns {String} Error message on failure, empty string on success
   */
  disablePoll(target, user) {
    const poll = this.getActivePoll(target)
    if (!poll) {
      return `Can not disable poll - no active poll exists for this channel`
    }
    try {
      poll.deactivate(target, user)
    } catch (error) {
      this.logger.error(`${error}`)
      return error.message
    }
  }

  /**
   * For now we'll assume we only store 1 poll per target
   * TODO: Support multiple polls per target
   *
   * @param   {String} target Target (channel) name
   * @returns {String} Target's current active poll or null if none
   */
  getActivePoll = (target) => {
    const poll = this.pollList[target] ?? null
    if (!poll) {
      return null
    }
    return poll.status === 'active' ? poll : null
  }

  /**
   * Get the most recent poll for a target, regardless of status
   *
   * @param   {String} target Target (channel) name
   * @returns {String} Target's current active poll or null if none
   */
  getLastPoll = (target) => {
    return this.pollList[target] || null
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

  /**
   * Parse a message into components delimited by spaces or blocks surrounded by quotes
   * Example: '100 "multi-word string" string' becomes ['100', 'multi-word string', 'string']
   *
   * @param {String} message
   * @returns {Array}
   */
  parseArguments(message) {
    // Search for whitespace or a captured group within quotes
    const regex = /[^\s"]+|"([^"]*)"/gi
    const parsedArray = []
    let match
    do {
      // exec() returns the next regex match as an array
      match = regex.exec(message)
      if (match != null) {
        // Index 1 in the array is the captured group if it exists
        // Index 0 is the matched text, which we use if no captured group exists
        parsedArray.push(match[1] ? match[1] : match[0])
      }
    } while (match != null)
    return parsedArray
  }
}
