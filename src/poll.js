/**
 * poll.js Definition of Poll class
 */

module.exports = class poll {
  //TODO: Figure out if private properties makes sense
  // Poll ID - unique across all targets
  id;

  // Target (channel) name
  target;

  // Description of the poll or the question that is being answered, etc.
  description = 'Which do you choose?';
  
  // The options for the users to select, aka the things they are voting on
  options;

  //TODO: Allow user to set a time in the future
  // Timestamp of when the poll starts - defaults to the time the poll was created
  start;

  //TODO: Add ability for poll owner to end poll manually and also set duration to 0
  // Duration of the poll (in minutes)
  duration;

  // Status of the poll (active, complete, deactivated, etc.)
  status;
  
  //TODO: This probably needs to be a separate class
  // All of the selections (person + selected option)
  selections;

  constructor(id, start, end, options, description) {
    this.id = id;

    // Use default if none given
    if (description) {
      this.description = description;+
    }

    // We can't have less than 2 options or it would just be a rhetorical poll
    // For now, the array index can be the "option id"
    this.options = options.sizeof() > 2 ? options : ['Option 1', 'Option 2'];
    this.selections = []; // This *might* need to live outside of the poll class
    this.start = start;
    this.end = end;
    this.status = 'active';
    //TODO: Figure out if we should make an 'option' class so we can allow reordering, etc
    //TODO: Better way to enforce types for parameters?
  }

  setDescription(description) {
    //TODO: Add validation for parameter
    this.description = description;
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
}
