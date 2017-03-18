var five = require('johnny-five');
var Tessel = require('tessel-io');
var board = new five.Board({
  io: new Tessel()
});

// var tessel = require('tessel'); // Import tessel
// var pins = tessel.port.B.pin.slice(1, 8);

// function readPins() {
//   pins.forEach((pin, idx) => {
//     pin.read((err, number) => {
//       if (err) {
//         throw err;
//       }

//       console.log('Value Pin %d is:', idx+1, number);
//     })
//   });
// }

// setInterval(readPins, 2000);

board.on('ready', function() {
  // var b1 = new five.Button('b1');
  //var b2 = new five.Button('b2');
  // var b6 = new five.Button('b6');
  // var b7 = new five.Button('b7');

  /*
  A0 -> 0
  A1 -> 1
  A2 -> 2
  ...
  A7 -> 7
  B0 -> 8
  B1 -> 9
  B2 -> 10
  B3 -> 11
  B4 -> 12
  B5 -> 13
  B6 -> 14
  B7 -> 15
  */

  // var b1 = new five.Button({ pin: 9, invert: true });
  // var b2 = new five.Button({ pin: 10});
  // var b3 = new five.Button({ pin: 11});
  // var b4 = new five.Button({ pin: 12});
  // var b5 = new five.Button({ pin: 13});
  // var b6 = new five.Button({ pin: 14});
  // var b7 = new five.Button({ pin: 15});

  var p0 = new five.Pin({ pin: 'b0'});
  var p1 = new five.Pin({ pin: 'b1'});
  var p2 = new five.Pin({ pin: 'b2'});
  var p3 = new five.Pin({ pin: 'b3'});
  var p4 = new five.Pin({ pin: 'b4'});
  var p5 = new five.Pin({ pin: 'b5'});
  var p6 = new five.Pin({ pin: 'b6', mode: 2 });
  var p7 = new five.Pin({ pin: 'b7', mode: 2 });

  var pins = [p0, p1, p2, p3, p4, p5, p6, p7];

  function turnLeds(vals) {
    vals.forEach((v, idx) => {
      pins[idx].write(v);
    });

    return pins.map(p => p.value);
  }


  board.repl.inject({
    p0: p0,
    p1: p1, 
    p2: p2,
    p3: p3, 
    p4: p4,
    p5: p5,
    p6: p6,
    p7: p7,
    turnLeds: turnLeds,
    startIteration: startIteration,
    clearLoop: clearLoop,
    readValues: readValues
  })

  var timeout;

  function readValues() {
    var analogPins = [p6, p7];

    analogPins.forEach((p, idx) => {
      console.log('Value Pin B%d:', idx+6, p.value);
    })
  }

  function clearLoop() {
    clearTimeout(timeout);
  }

  function startIteration() {
    var i = 0;

    function loop() {
      var flags = i.toString(2).split('').reverse().map(d => parseInt(d, 10));
      console.log('Setting ', flags);
      flags.forEach((val, idx) => {
        pins[idx].write(val);
      });

      i++;

      if (i < Math.pow(2, pins.length)) {
        timeout = setTimeout(loop, 2000);
      }
    }
    
    loop();
  }



  // var currentValues = [0, 0, 0, 0, 0, 0, 0];
  // pins.forEach((pin, idx) => {
  //   pin.read((err, val) => {
  //     currentValues[idx] = val;
  //   })
  // })


  // setInterval(function () {
  //   console.log('Pins', currentValues);
  // }, 3000)

  // var buttons = [b1, b2, b6, b7];
  // var buttonPressed = [false, false, false, false];

  // buttons.forEach((btn, idx) => {
  //   btn.on('press', () => {
  //     buttonPressed[idx] = true;
  //     console.log('Pressed button no.%d', idx+1);
  //     console.log(buttonPressed);
  //   })

  //   btn.on('release', () => {
  //     buttonPressed[idx] = false;
  //     console.log('Released button no.%d', idx+1);
  //     console.log(buttonPressed);
  //   })
  // });


});