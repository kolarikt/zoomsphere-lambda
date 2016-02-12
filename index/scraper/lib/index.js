/**
 * Lib
 */

module.exports.respond = function(event, cb) {

  var response = {
    message: "Your Serverless function ran successfully!"
  };

  var request = require('request');

  return cb(null, response);
};