var Flint = require('node-flint');
var webhook = require('node-flint/webhook');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
const config = require("./config.json");

// init flint
var flint = new Flint(config);
flint.start();
console.log("Starting flint, please wait...");

//Welcome message when a new room or 1:1 is spawned with the bot
flint.on('spawn', function(bot) {
  flint.debug('new bot spawned in room: %s', bot.room.id);
  
  //presents different messages based on room or 1:1 
  if(bot.isGroup){
     bot.say("Hi! To get started just type @Pepiq Hello.");
  }else{
    bot.say("Hi! To get started just type Hello.");
  }; 
  bot.repeat;
});

// say hello
flint.hears('hello', function(bot, trigger) {
  bot.say('Hello %s! ' + 'Thank you for getting in touch with Pepiq. What can I help you with?', trigger.personDisplayName);
});


// default message for unrecognized commands
flint.hears(/.*/, function(bot, trigger) {
  bot.say('Sorry, not sure I understand that');
}, 20);

// add flint event listeners
flint.on('message', function(bot, trigger, id) {
  flint.debug('"%s" said "%s" in room "%s"', trigger.personEmail, trigger.text, trigger.roomTitle);  

});

flint.on('initialized', function() {
  flint.debug('initialized %s rooms', flint.bots.length);
  console.log('initialized %s rooms', flint.bots.length);
});

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