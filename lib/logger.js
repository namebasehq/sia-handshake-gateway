const moment = require('moment');

function logWithTime(logger) {
  return content => {
    const time = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    logger(`${time}: `, content);
  };
}

module.exports = {
  info: logWithTime(console.info.bind(console)),
  error: logWithTime(console.error.bind(console)),
};
