#!/usr/bin/env node

const SnaarfBot = require('./snaarfBot')

// Create the dependencies for a SnaarfBot object
const logger = require('./logger')
const dotenv = require('dotenv')
const constants = require('./constants')

// Initialize environment variables and "global" constants
dotenv.config()
if (!process.env) {
  throw new Error(
    'Unable to initialize environment variables. Did you create a .env file in your repo root?'
  )
}

const client = require('./tmi')

if (!constants) {
  throw new Error(
    'Unable to initialize constants. Make sure "src/constants.js" exists, is readable and exports something.'
  )
}

/* eslint no-unused-vars: "off" -- Functionality is handled by event handlers, so we only need to create an instance */
const snaarfBot = new SnaarfBot(logger, constants, client)
