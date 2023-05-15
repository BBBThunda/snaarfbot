#!/usr/bin/env node
/**
 * snaarfBot.js - Main entrypoint for SnaarfBot
 */
var Poll = require('./poll');

//TODO: Implement ability to handle multiple channels simultaneously
//TODO: Make the globals persistent later
//TODO: Write unit tests

class SnaarfBot {

  /** @property {object} connectionOpts Info required to connect. See tmi.js docs for format, etc. */
  connectionOpts;

  /** @property {object} client IRC Client created and initialized by tmi.js */
  client;

  /** @property {string} path path of the repo's "src" directory on the current system (pulled from env vars) */
  path;

  /** @property {Array} Constants to be used globally for the application */
  constants;

  /** @property {Poll[string][int]} polls All Poll objects indexed by channel, pollId */
  polls = [];

  constructor () {
    // Initialize environment variables and "global" constants
    const dotenv = require('dotenv');
    dotenv.config();
    if (!process.env) {
      throw new Error('Unable to initialize environment variables. Did you create a .env file in your repo root?');
    }
    this.constants = require(process.env.SRC_PATH + '/constants');
    if (!this.constants) {
      throw new Error('Unable to initialize constants. Make sure "src/constants.js" exists, is readable and exports something.');
    }

    // Create a connection to IRC with tmi.js
    const tmi = require('tmi.js');
    // Define configuration options
    this.connectionOpts = {
      identity: {
        username: process.env.BOT_ACCOUNT,
        password: 'oauth:' + process.env.OAUTH_TOKEN
      },
      channels: [
        process.env.CHANNEL
      ]
    };
    // Create a client with our options
    var client = new tmi.client(this.connectionOpts);

    // Register our event handlers (defined below)
    client.on('message', this.onMessageHandler);
    client.on('connected', this.onConnectedHandler);
    client.on('cheer', this.onCheerHandler);

    // Connect to Twitch:
    client.connect();

    this.client = client;
  }

  /**
   * Called every time a message comes in
   *
   * @param {string} target  Target channel where message was sent
   * @param {array}  context Metadata about the message (sender, type, etc.)
   * @param {string} msg     The actual message text
   * @param {bool}   isMe    Whether the message was sent by this bot
   */
  onMessageHandler = (target, context, msg, isMe) => {
    // Ignore messages from the bot
    if (isMe) { return; }

    // Useful context fields for reference (not used yet)
    const chatUserId = context['user-id'];
    const chatUserName = context['display-name'];

    const msgParts = msg.trim().split(' ');
    // Ignore messages that are not bot commands
    if (!msgParts[0] || msgParts[0].charAt(0) != '!') { return; }

    // If it's a command, parse it
    const args = msgParts.slice(1);
    const commandName = msgParts[0].substr(1, msgParts[0].length - 1);

    // If the command is known, let's execute it
    switch (commandName) {
      case 'dice':
        // console.log(context);
        this.getDiceRoll(target, context, args);
        console.log(`* Executed ${commandName} command`);
        break;
      default:
        console.log(`* Unknown command ${commandName}`);
    }
  }

  /**
   * 
   * @param {*} target 
   * @param {*} context 
   * @param {*} args 
   */
  getDiceRoll = (target, context, args) => {
    const sides = args[0] ?? null;
    const result = this.rollDie(sides);
    // @Username or You
    const prefixUsername = context['display-name'] ? '@' + context['display-name'] : 'You';
    this.client.say(target, prefixUsername + ' rolled a ' + result);
  }

  /** 
   * Roll a die with a given number of sides and return the result
   * 
   * @param int sides Number of sides of the die (default 6)
   * 
   * @returns int Result of die roll.
  */ 
  rollDie = (sides) => (Math.floor(Math.random() * (sides ?? this.constants.DEFAULT_DIE_SIDES)) + 1)

  // Called every time the bot connects to Twitch chat
  onConnectedHandler = (addr, port) => {console.log(`* Connected to ${addr}:${port}`);}

  //TODO: Figure out what parameters are passed to cheer event handlers
  //TODO: Figure out how to test with real(ish?) data
  onCheerHandler = (target, context, message) => {
    
  }

};

let snaarfBot = new SnaarfBot();
