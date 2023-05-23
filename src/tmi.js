const tmi = require('tmi.js')
const connectionOpts = {
  identity: {
    username: process.env.BOT_ACCOUNT,
    password: 'oauth:' + process.env.OAUTH_TOKEN,
  },
  channels: [process.env.CHANNEL],
}
/* eslint new-cap: "off" -- tmi.js is an external library that does not conform to eslint standard rules */
module.exports = new tmi.client(connectionOpts)
