var http = require('http');
var getRawBody = require('raw-body');
var localtunnel = require('localtunnel');
var url = require('url');
var Latissima = require('./latissima').Latissima;
var server = http.createServer(handleRequests);
var PORT = process.env.PORT || 3000;
var TOKEN = 'r87c8wau3xsjy9vv6h9k65hfr';
var coffeeMachine;
server.listen(PORT, function () {
    console.log("Server running on port " + PORT);
    localtunnel(PORT, { subdomain: 'latissima' }, function (err, tunnel) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        // the assigned public url for your tunnel
        // i.e. https://abcdefgjhij.localtunnel.me
        console.log('Tunnel url:' + tunnel.url);
        coffeeMachine = new Latissima();
        coffeeMachine.on('ready', function () {
            console.log("Coffee machine initialized");
        });
    });
});
function handleRequests(req, res) {
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
            var data = [];
            res.write(data.join('\n'));
        }
        else if (req.url.indexOf('/pot-0') === 0) {
            var data = ['isOn=' + coffeeMachine.isOn];
            res.write(data.join('\n'));
        }
        else {
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
            return;
        }
        if (!isAuthenticated(req)) {
            res.statusCode = 401;
            res.statusMessage = 'Unauthorized';
            res.end();
            return;
        }
        var additions = getAdditionsRequested(req);
        var invalidAdditions = additions.filter(function (a) { return !isValidAddition(a); });
        if (invalidAdditions.length > 0) {
            res.statusCode = 406;
            res.statusMessage = 'Not Acceptable';
            res.write(coffeeMachine.additions.join('; '));
            return res.end();
        }
        additions = additions.filter(isValidAddition);
        getRawBody(req, { encoding: 'utf-8' }, function (err, body) {
            var command = parseCoffeeMessageBody(body);
            if (err || !command) {
                res.statusCode = 400;
                res.statusMessage = 'Bad Request';
                return res.end();
            }
            if (req.url.indexOf('/pot-0/') !== 0) {
                if (req.url.indexOf('/pot-0' === 0)) {
                    if ((command === 'start' && !coffeeMachine.isOn) || (command === 'stop' && coffeeMachine.isOn)) {
                        coffeeMachine.pressPower().then(function () {
                            res.statusCode = 200;
                            res.write(command + 'ed');
                            return res.end();
                        });
                    }
                    else {
                        res.statusCode = 400;
                        res.statusMessage = 'Bad Request';
                        return res.end();
                    }
                }
                else {
                    res.statusCode = 404;
                    res.statusMessage = 'Not Found';
                    return res.end();
                }
            }
            else {
                var typeEndpoint = url.parse(req.url).pathname.replace('/pot-0/', '');
                // TODO: No difference at the moment between start and stop
                // TODO: Need to handle additions
                console.log('Pressing', typeEndpoint);
                if (Latissima.Types[typeEndpoint]) {
                    console.log('Pressing');
                    coffeeMachine.press(Latissima.Types[typeEndpoint])
                        .then(function () {
                        console.log('Pressed');
                        res.statusCode = 200;
                        res.write(command + 'ed');
                        return res.end();
                    });
                }
                else {
                    res.statusCode = 404;
                    res.statusMessage = 'Not Found';
                    return res.end();
                }
            }
        });
    }
}
function isAuthenticated(req) {
    var query = url.parse(req.url, true).query;
    console.log(query);
    if (query.token && query.token === TOKEN) {
        return true;
    }
    return (req.headers['coffee-authorization'] || '').replace('Bearer ', '') === TOKEN;
}
function hasCorrectContentType(req) {
    return req.headers['content-type'] === 'application/coffee-pot-command'
        || req.headers['content-type'] === 'text/plain';
}
function isValidAddition(addition) {
    return coffeeMachine.additions.indexOf(addition) !== -1;
}
function getAdditionsRequested(req) {
    var header = req.headers['accept-additions'];
    var milkType = ['Cream', 'Half-and-half', 'Whole-milk', 'Part-Skim', 'Skim', 'Non-Dairy'];
    var syrupType = ['Vanilla', 'Almond', 'Raspberry', 'Chocolate'];
    var alcoholType = ['Whisky', 'Rum', 'Kahlua', 'Aquavit'];
    var spiceType = []; /** NO LIST DEFINIED IN RFC */
    var validTypes = [
        '*'
    ].concat(milkType, syrupType, alcoholType, spiceType);
    if (!header) {
        return [];
    }
    return header.split(';')
        .map(function (type) { return type.trim(); })
        .filter(function (type) { return validTypes.indexOf(type) !== -1; });
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
