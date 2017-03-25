const five = require('johnny-five');
const Tessel = require('tessel-io');
const board = new five.Board({
  io: new Tessel()
});

board.on('ready', () => {
  const espresso = new five.Relay({
    pin: 'a4',
    type: 'NO'
  });
  const grande = new five.Relay({
    pin: 'a5',
    type: 'NO'
  });
  const power = new five.Relay({
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