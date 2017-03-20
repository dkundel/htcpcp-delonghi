const http = require('http');
const getRawBody = require('raw-body');
const localtunnel = require('localtunnel');

const { Latissima } = require('./latissima');

const server = http.createServer(handleRequests);
const PORT = process.env.PORT || 3000;

let coffeeMachine;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  localtunnel(PORT, {subdomain: 'latissima'}, function(err, tunnel) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    // the assigned public url for your tunnel
    // i.e. https://abcdefgjhij.localtunnel.me
    console.log('Tunnel url:' + tunnel.url);
     coffeeMachine = new Latissima();

    coffeeMachine.on('ready', () => {
      console.log(`Coffee machine initialized`);
    });
  });
});


function handleRequests(req, res) {
  console.log(req);
  if (coffeeMachine.isTeapot) {
    res.statusCode = 418;
    res.statusMessage = "I'm a teapot";
    res.write("I'm a teapot");
    return res.end();
  }

  if (req.method === 'GET') {
    console.log('GET');
    res.setHeader('Safe', 'yes');
    res.setHeader('Content-Type', 'message/coffeepot');
    if (req.url.indexOf('/pot-0/') === 0) {
      console.log('TYPE INFO');
      // TODO: Implement status of coffee production
      let data = [];
      res.write(data.join('\n'));
    } else if (req.url.indexOf('/pot-0') === 0) {
      let data = ['isOn='+coffeeMachine.isOn]
      res.write(data.join('\n'));
    } else {
      res.statusCode = 404;
    }
    return res.end();
  }

  if (req.method === 'POST' || req.method === 'BREW') {
    // TODO once we have a proper status we should set this
    res.setHeader('Safe', 'yes');
    if (!hasCorrectContentType(req)) {
      res.statusCode = 415;
      res.statusMessage = 'Unsupported Media Type';
      res.end();
    }

    function isValidAddition(addition) {
      return coffeeMachine.additions.indexOf(addition) !== -1;
    }

    let additions = getAdditionsRequested(req)
    let invalidAdditions = additions.filter(a => !isValidAddition(a));
    
    if (invalidAdditions.length > 0) {
      res.statusCode = 406;
      res.statusMessage = 'Not Acceptable';
      res.write(coffeeMachine.additions.join('; '));
      return res.end();
    }

    additions = additions.filter(isValidAddition);

    getRawBody(req, { encoding: 'utf-8' }, (err, body) => {
      let command = parseCoffeeMessageBody(body);
      if (err || !command) {
        res.statusCode = 400;
        res.statusMessage = 'Bad Request';
        return res.end();
      }

      if (req.url.indexOf('/pot-0/') !== 0) {
        if (req.url.indexOf('/pot-0' === 0)) {
          if ((command === 'start' && !coffeeMachine.isOn) || (command === 'stop' && coffeeMachine.isOn)) {
            coffeeMachine.pressPower().then(() => {
              res.statusCode = 200;
              res.write(command + 'ed');
              return res.end();
            });
          } else {
            res.statusCode = 400;
            res.statusMessage = 'Bad Request';
            return res.end();
          }
        } else {
          res.statusCode = 404;
          res.statusMessage = 'Not Found';
          return res.end();
        }
      }

      const typeEndpoint = req.url.replace('/pot-0/', '');
      
      // TODO: No difference at the moment between start and stop
      // TODO: Need to handle additions
      if (Latissima.Types[typeEndpoint]) {
        coffeeMachine.press(Latissima.Types[typeEndpoint])
        .then(() => {
          res.statusCode = 200;
          res.write(command+'ed');
          return res.end();
        });
      } else {
        res.statusCode = 404;
        res.statusMessage = 'Not Found';
        return res.end();
      }
    })
  }
}

function hasCorrectContentType(req) {
  return req.headers['content-type'] === 'application/coffee-pot-command';
}

function getAdditionsRequested(req) {
  let header = req.rawHeaders['Accept-Additions'];
  let milkType = ['Cream', 'Half-and-half', 'Whole-milk', 'Part-Skim', 'Skim', 'Non-Dairy'];
  let syrupType = ['Vanilla', 'Almond', 'Raspberry', 'Chocolate'];
  let alcoholType = ['Whisky', 'Rum', 'Kahlua', 'Aquavit'];
  let spiceType = []; /** NO LIST DEFINIED IN RFC */
  let validTypes = [
    '*', 
    ...milkType,
    ...syrupType,
    ...alcoholType,
    ...spiceType
  ];

  if (!header) {
    return [];
  }

  return header.split(';')
    .map(type => type.trim())
    .filter(type => validTypes.indexOf(type) !== -1);
}

function parseCoffeeMessageBody(body) {
  body = body
    .toLowerCase()
    .trim()
    .replace(/coffee-message-body\s*=\s*/, '');
  
  if (body === 'start' || body === 'stop') {
    return body;
  }
  return null;
}
