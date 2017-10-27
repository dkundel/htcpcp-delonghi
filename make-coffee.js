const { SUBDOMAIN, TOKEN } = require('./config');
const { post } = require('got');

const BASE_URL = `https://${SUBDOMAIN}.localtunnel.me`;
const URL = `${BASE_URL}/pot-0/espresso?token=${TOKEN}`;

async function makeCoffee() {
  const resp = await post(URL, {
    headers: {
      'Content-Type': 'application/coffee-pot-command'
    },
    body: 'start'
  });

  console.log('Enjoy your ☕️');
}

makeCoffee().catch(err => console.error(err));
