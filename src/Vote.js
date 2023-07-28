/**
 * poll.js Definition of Vote class
 */

module.exports = class Vote {
  /** @property {String} id Vote ID - unique across all targets */
  id

  /** @property {String} voter ID of user who created the vote */
  voter

  /** @property {number} option The option the user voted for */
  option

  /** @property {Date} voteTime Timestamp of when the vote was case in ms since UNIX epoch - defaults to the time the poll was created */
  voteTime

  /**
   * Create a new Vote object - 1 vote per user ID per target per poll ID
   *
   * @param {String} user   User ID of the person casting the vote
   * @param {number} option Selected poll option - the option should match the index on Poll.options
   */
  constructor(user, option) {
    const NOW = Date.now()
    // Create a UUID for the Poll
    this.id = require('crypto')
    this.voter = user
    this.option = option
    this.voteTime = NOW
  }

  /**
   * Validate that params are valid before creating a new Vote object and
   *  provide a user-friendly error message on faliure.
   *
   * @param   {Poll}   poll
   * @param   {String} user   User ID of the person casting the vote
   * @param   {number} option Selected poll option - the option should match the index on Poll.options
   * @returns {String} Error message or null string if validation passed
   */
  static validateConstructorParams(poll, user, option) {
    if (typeof user !== 'string') {
      return `User is invalid`
    }
    if (isNaN(option) || typeof option !== 'number') {
      return `<option> must be numeric`
    }
    if (!poll) {
      return `Invalid poll used for validation. Please notify the developers.`
    }
    if (!poll.options[option]) {
      return `<option> must be one of the possible choices for the current poll`
    }
    return ``
  }
}
