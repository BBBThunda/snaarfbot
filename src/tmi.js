// Create a connection to IRC with tmi.js
const tmi = require('tmi.js')
// Define configuration options
this.connectionOpts = {
  identity: {
    username: process.env.BOT_ACCOUNT,
    password: 'oauth:' + process.env.OAUTH_TOKEN,
  },
  channels: [process.env.CHANNEL],
}
// Create a client with our options
/* eslint new-cap: "off" -- Constructor is from an external library and doesn't follow standard eslint guidelines */
module.exports = new tmi.client(this.connectionOpts)
