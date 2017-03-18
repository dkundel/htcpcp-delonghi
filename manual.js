var five = require('johnny-five');
var Tessel = require('tessel-io');
var board = new five.Board({
  io: new Tessel()
});

board.on('ready', function () {
  var espresso = new five.Relay({
    pin: 'a4',
    type: 'NO'
  });
  var grande = new five.Relay({
    pin: 'a5',
    type: 'NO'
  });
  var power = new five.Relay({
    pin: 'a6',
    type: 'NO'
  });
  espresso.close();
  grande.close();
  power.close();

  board.repl.inject({
    espresso: espresso,
    grande: grande,
    power: power
  });
});