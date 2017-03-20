const EventEmittter = require('events');
const { Board, Relay, Pin } = require('johnny-five');
const Promise = require('bluebird');
const Tessel = require('tessel-io');

const PRESS_DURATION = 500;

class Latissima extends EventEmittter {
  /* Board */
  board = undefined;

  /* Relays */
  espressoRelay = undefined;
  grandeRelay = undefined;
  powerRelay = undefined;

  /* Digital Pins */

  /* Others */
  isOn = true;
  isTeapot = false;
  
  /* Available Additions */
  additions = [];

  /* Coffee Types */
  static Types = {
    espresso: 1,
    grande: 2
  };


  constructor(debug = false) {
    super();
    this.board = new Board({
      io: new Tessel(),
      repl: debug,
      debug: debug
    });

    this.board.on('ready', () => {
      this.initializePins();
      this.addBoardEvents();
      this.emit('ready');
    });
  }

  addBoardEvents() {

  }

  initializePins() {
    this.espressoRelay = new Relay({
      pin: 'a4',
      type: 'NO'
    });
    this.espressoRelay.close();
    this.grandeRelay = new Relay({
      pin: 'a5',
      type: 'NO'
    });
    this.grandeRelay.close();
    this.powerRelay = new Relay({
      pin: 'a6',
      type: 'NO'
    });
    this.powerRelay.close();
  }

  pressPower() {
    if (!this.isOn) {
      // it needs to heat up for ~20 seconds
      // TODO: Remove this when we can read if the machine is on
      setTimeout(() => {
        this.isOn = true;
      }, 21 * 1000)
    } else {
      this.isOn = true;
    }

    return this.pressButton(this.powerRelay);
  }

  press(type) {
    switch(type) {
      case Latissima.Types.espresso:
        return this.pressButton(this.espressoRelay);
      case Latissima.Types.grande:
        return this.pressButton(this.grandeRelay);
      default:
        return Promise.reject(new Error("Could not find Type"));
    }
  }

  pressButton(relay) {
    return new Promise((resolve, reject) => {
      relay.open();
      setTimeout(() => {
        relay.close();
        resolve();
      }, PRESS_DURATION);
    });
  }
}

module.exports = { Latissima };