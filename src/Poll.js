/**
 * poll.js Definition of Poll class
 */
const { constants } = require('./constants')

module.exports = class Poll {
  // Minimum Poll length in minutes
  MIN_POLL_LENGTH = 10

  // Maximum Poll length in minutes
  MAX_POLL_LENGTH = 1440

  // Default Poll length in minutes
  DEFAULT_POLL_LENGTH = 120

  /** @property {String} id Vote ID - unique across all targets */
  id

  /** @property {String} target Target (channel) name */
  target

  /** @property {String} creator ID of the user who created the poll */
  creator

  /**
   * Description of the poll or the question that is being answered, etc.
   * @property {String} description
   */
  description

  /**
   * The options for the users to select, aka the things they are voting on
   * @property {String[]} options
   */
  options

  /**
   * Timestamp of when the poll starts in ms since UNIX epoch
   *  -defaults to the time the poll was created
   * @property {Date} start
   */
  start

  /**
   * Timestamp of when the poll ends in ms since UNIX epoch
   *  -start + length
   * @property {Date} start
   */
  end

  /**
   * Status of the poll (active, complete, deactivated)
   * @property {String} status
   */
  status

  // TODO: Selection should be a separate class
  // All of the selections (person + selected option)
  selections

  /**
   * Create a new Poll object - should not be allowed if an active Poll exists for the target
   *
   * @param {String}   target
   * @param {String}   user
   * @param {String}   description
   * @param {String[]} options
   * @param {number}   length
   */
  constructor(target, user, description, options, length) {
    const NOW = Date.now()
    // Create a UUID for the Poll
    this.id = require('crypto')
    this.target = target
    this.creator = user
    this.description = description
    this.options = options
    this.start = NOW
    this.status = 'active'
    this.selections = []

    // We can't have less than 2 options or it would just be a rhetorical poll
    this.options = options

    // Calculate end as NOW + length minutes
    const constants = require('./constants')
    length = length || this.DEFAULT_POLL_LENGTH
    this.end = this.start + length * constants.MS_PER_MIN
  }

  /**
   * Validate that params are valid before creating a new Poll and provide a
   *  user-friendly error message on faliure.
   *
   * @param {String}   target
   * @param {String}   user
   * @param {String}   description
   * @param {String[]} options
   * @param {number}   length
   *
   * @returns {String} Error message or null string if validation passed
   */
  static validateConstructorParams(target, user, description, options, length) {
    // TODO: See if TypeScript will make this type checking easier/unnecessary
    if (typeof target !== 'string') {
      return 'Target (Channel Name) is invalid.'
    }
    if (typeof user !== 'string') {
      return 'User is invalid'
    }
    if (typeof description !== 'string') {
      return 'Description is invalid'
    }
    if (description.trim() === '') {
      return 'Description can not be empty'
    }
    if (!Array.isArray(options)) {
      return 'Invalid options list given.'
    }
    if (options.length < 2) {
      return 'A poll must have at least 2 options.'
    }
    for (let i = 0; i < options.length; i++) {
      if (typeof options[i] !== 'string') {
        return 'Invalid option given.'
      }
    }
    console.log(length)
    if (length && typeof length !== 'number') {
      return '<length> must be a number representing the length of the poll in minutes.'
    }
    if (length && length < this.MIN_POLL_LENGTH) {
      return (
        '<length> must be at least ' +
        this.MIN_POLL_LENGTH +
        ' minutes to allow users time to vote.'
      )
    }
    if (length && length > this.MAX_POLL_LENGTH) {
      return (
        '<length> can not be longer than ' +
        this.MAX_POLL_LENGTH +
        ' minutes (' +
        this.MAX_POLL_LENGTH / constants.MIN_PER_HR +
        ' hours)'
      )
    }
    return ''
  }

  /**
   * Update the status of the poll based on state
   * This should be called before any mutation
   */
  updateStatus() {
    if (this.status === 'active' && Date.now() >= this.end) {
      this.complete()
    }
  }

  // Disable Poll
  deactivate(target, userId) {
    if (this.target !== target) {
      throw new Error('Failed to disable poll - incorrect target')
    }
    if (this.status !== 'active') {
      throw new Error('Failed to disable poll - poll not active')
    }
    this.status = 'deactivated'
  }

  /**
   * Mark the poll as complete, and perform any related actions
   */
  complete() {
    if (this.status !== 'active') {
      throw new Error('Failed attempting to complete a non-active Poll.')
    }
    this.status = 'complete'
    // DEBUG!!! PROCESS RESULTS
  }

  /**
   * Get the amount of time remaining before the Poll completes
   *
   * @returns The remaining time in ms
   */
  getTimeRemaining() {
    return this.end - Date.now()
  }

  /**
   * Get all the data needed to display the current state of the Poll
   *
   * @returns { object } JSON object containing data
   */
  getDisplayData() {
    return {
      id: this.id,
      description: this.description,
      options: this.options,
      selections: this.selections,
      endTime: this.end,
      timeRemaining: this.getTimeRemaining(),
    }
  }
}
