#!/usr/bin/env node

class SnaarfBot {
  /** @property {Object} connectionOpts Info required to connect. See tmi.js docs for format, etc. */
  connectionOpts

  /** @property {Object} client IRC Client created and initialized by tmi.js */
  client

  /** @property {string} path path of the repo's "src" directory on the current system (pulled from env vars) */
  path

  /** @property {Array} Constants to be used globally for the application */
  constants

  /** @property {Object} logger Logger client for handling/formatting logs to console */
  logger

  constructor() {
    this.logger = require('./logger')
    const dotenv = require('dotenv')
    const client = require('./tmi')

    // Initialize environment variables and "global" constants
    dotenv.config()
    if (!process.env) {
      throw new Error(
        'Unable to initialize environment variables. Did you create a .env file in your repo root?'
      )
    }
    this.constants = require(process.env.SRC_PATH + '/constants')
    if (!this.constants) {
      throw new Error(
        'Unable to initialize constants. Make sure "src/constants.js" exists, is readable and exports something.'
      )
    }

    // Create a connection to IRC with tmi.js
    // Register our event handlers
    client.on('connected', this.onConnectedHandler)
    client.on('message', this.onMessageHandler)
    client.on('cheer', this.onCheerHandler)
    // Connect to Twitch and cache the client
    client.connect()
    this.client = client
  }

  // Called every time the bot connects to Twitch chat
  onConnectedHandler = (addr, port) => {
    this.logger.info(`* Connected to ${addr}:${port}`)
  }

  /**
   * Called every time a message comes in
   *
   * @param {string} target  Target channel where message was sent
   * @param {Object}  context Metadata about the message (sender, type, etc.)
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
    const sides = args[0] ?? null
    const result = this.rollDie(sides)
    // @Username or You
    const prefixUsername = context['display-name']
      ? '@' + context['display-name']
      : 'You'
    // Send message via bot user with result of command
    const message = prefixUsername + ' rolled a ' + result + ', Schneeyarrrf!'
    this.logger.info(message)
    this.client.say(target, message)
  }

  /**
   * Roll a die with a given number of sides and return the result
   *
   * @param {number} sides Number of sides of the die (default 6)
   *
   * @returns {number} Result of die roll.
   */
  rollDie = (sides) =>
    Math.floor(Math.random() * (sides ?? this.constants.DEFAULT_DIE_SIDES)) + 1

  onCheerHandler = (target, context, message) => {}
}

/* eslint no-unused-vars: "off" -- Functionality is handled by event handlers, so we only need to create an instance */
const snaarfBot = new SnaarfBot()
