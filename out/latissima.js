var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var EventEmittter = require('events');
var _a = require('johnny-five'), Board = _a.Board, Relay = _a.Relay, Pin = _a.Pin;
var Promise = require('bluebird');
var Tessel = require('tessel-io');
var PRESS_DURATION = 500;
var Latissima = (function (_super) {
    __extends(Latissima, _super);
    function Latissima(debug) {
        if (debug === void 0) { debug = false; }
        var _this = _super.call(this) || this;
        /* Board */
        _this.board = undefined;
        /* Relays */
        _this.espressoRelay = undefined;
        _this.grandeRelay = undefined;
        _this.powerRelay = undefined;
        /* Digital Pins */
        /* Others */
        _this.isOn = true;
        _this.isTeapot = false;
        /* Available Additions */
        _this.additions = [];
        _this.board = new Board({
            io: new Tessel(),
            repl: debug,
            debug: debug
        });
        _this.board.on('ready', function () {
            _this.initializePins();
            _this.addBoardEvents();
            _this.emit('ready');
        });
        return _this;
    }
    Latissima.prototype.addBoardEvents = function () {
    };
    Latissima.prototype.initializePins = function () {
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
    };
    Latissima.prototype.pressPower = function () {
        var _this = this;
        if (!this.isOn) {
            // it needs to heat up for ~20 seconds
            // TODO: Remove this when we can read if the machine is on
            setTimeout(function () {
                _this.isOn = true;
            }, 21 * 1000);
        }
        else {
            this.isOn = false;
        }
        return this.pressButton(this.powerRelay);
    };
    Latissima.prototype.press = function (type) {
        switch (type) {
            case Latissima.Types.espresso:
                return this.pressButton(this.espressoRelay);
            case Latissima.Types.grande:
                return this.pressButton(this.grandeRelay);
            default:
                return Promise.reject(new Error("Could not find Type"));
        }
    };
    Latissima.prototype.pressButton = function (relay) {
        return new Promise(function (resolve, reject) {
            relay.open();
            setTimeout(function () {
                relay.close();
                resolve();
            }, PRESS_DURATION);
        });
    };
    return Latissima;
}(EventEmittter));
/* Coffee Types */
Latissima.Types = {
    espresso: 1,
    grande: 2
};
module.exports = { Latissima: Latissima };
