const { createLogger, format, transports } = require("winston");
const { combine, json, label, printf, timestamp } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`;
});

module.exports = createLogger({
    format: combine(
        timestamp(),
        label({label: 'SnaarfBot'}),
        json(),
        myFormat
    ),
    transports: [new transports.Console()]
});
