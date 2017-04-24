var Flint = require('node-flint');
var webhook = require('node-flint/webhook');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

// flint options
var config = {
  webhookUrl: 'https://niro-spark-bot.herokuapp.com/flint',
  token: 'NTFkYjAyMDgtNTdkZi00YjQ5LWE5OTItNzY2Mzk5MGUzYmIyNDJlNGRmNDItMDJk',
  port: 8080,
  removeWebhooksOnStart: false,
  maxConcurrent: 5,
  minTime: 50
};

// init flint
var flint = new Flint(config);
flint.start();
console.log("Starting flint, please wait...");

// say hello
flint.hears('hello', function(bot, trigger) {
  bot.say('Hello %s!', trigger.personDisplayName);
});

// add flint event listeners
flint.on('message', function(bot, trigger, id) {
  flint.debug('"%s" said "%s" in room "%s"', trigger.personEmail, trigger.text, trigger.roomTitle);
  console.log('"%s" said "%s" in room "%s"', trigger.personEmail, trigger.text, trigger.roomTitle);
});

flint.on('initialized', function() {
  flint.debug('initialized %s rooms', flint.bots.length);
});

// default message for unrecognized commands
flint.hears(/.*/, function(bot, trigger) {
  bot.say('Sorry did not understand what you said!');
}, 20);

// define express path for incoming webhooks
app.post('/flint', webhook(flint));

// start express server
var port = process.env.PORT || config.port;

var server = app.listen(port, function () {
  flint.debug('Flint listening on port %s', port);
});

// gracefully shutdown (ctrl-c)
process.on('SIGINT', function() {
  flint.debug('stoppping...');
  server.close();
  flint.stop().then(function() {
    process.exit();
  });
});