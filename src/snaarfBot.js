#!/usr/bin/env node

const dotenv = require('dotenv');
dotenv.config();

const tmi = require('tmi.js');

// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_ACCOUNT,
    password: 'oauth:' + process.env.OAUTH_TOKEN
  },
  channels: [
    process.env.CHANNEL
  ]
};

// Create a client with our options
const client = new tmi.client(opts);
var polls = [];

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('cheer', onCheerHandler);

// Connect to Twitch:
client.connect();

//TODO: create a global array to hold instances
//TODO: Make the globals persistent later
//TODO: Put the globals (and maybe event bindings?) into a func/class so we can unit test
//TODO: Annotate classes
//TODO: Pull classes into separate files
class poll {
  //TODO: Figure out if private properties makes sense
  // Poll ID - unique across all targets
  id;
  question = 'Which do you choose?';
  options;
  start;
  end;
  selection;
  enabled;
  
  constructor(id, start, end, options, question) {
    this.id = id;

    // Use default if none given
    if (question) {
      this.question = question;
    }

    // We can't have less than 2 options or it would just be a rhetorical poll
    // For now, the array index can be the "option id"
    this.options = options.sizeof() > 1 ? options : ['Option 1', 'Option 2'];
    this.selection = []; // This *might* need to live outside of the poll class
    this.start = start;
    this.end = end;
    this.enabled = true;
    //TODO: Figure out if we should make an 'option' class so we can allow reordering, etc
    //TODO: Better way to enforce types for parameters?
  }

  setQuestion(question) {
    //TODO: Add validation for parameter
    this.question = question;
  }

  addOption(option) {
    //TODO: Add validation for parameter, including not allowing changes once poll is active
    this.options.push(option);
  }

  setStart(start) {
    //TODO: Add validation for parameter. Don't allow change if poll has already started
    this.start = start;
  }

  setEnd(end) {
    //TODO: Add validation for parameter. Don't allow change after poll ended
  }

  // Disable Poll
  disablePoll() {
    //TODO: Do we need to do anything to make sure votes can be reapplied elsewhere without being duplicated?
    this.enabled = false;
  }
};

// Called every time a message comes in
//
// @param string target  Target channel where message was sent
// @param array  context Metadata about the message (sender, type, etc.)
// @param string msg     The actual message text
// @param bool   self    Whether the message was sent by this bot
function onMessageHandler (target, context, msg, self) {
  // Ignore messages from the bot
  if (self) { return; }

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
      console.log(context);
      const num = rollDice(args[0] ?? null);
      client.say(target, `You rolled a ${num}`);
      console.log(`* Executed ${commandName} command`);
      break;
    default:
      console.log(`* Unknown command ${commandName}`);
  }
}

// Roll a die with a given number of sides and return the result
//
// @param int sides Number of sides of the die (default 6)
function rollDice (sides = 6) {
  return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

//TODO: Figure out what parameters are passed to cheer event handlers
//TODO: Figure out how to test with real(ish?) data
function onCheerHandler (target, context, message) {
  
}
