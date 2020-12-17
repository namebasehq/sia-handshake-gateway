const dns = require('dns');

async function getUsing(strategies, domainName) {
  // attempt to resolve using each strategy, in order
  const errors = [];
  for (const [label, strategy, dontLogErrors] of strategies) {
    try {
      const hash = await strategy(domainName);
      if (typeof hash === 'string') {
        console.error(`${label}: successfully resolved "${domainName}"`);
        return hash;
      }
    } catch (err) {
      // don't log errors yet!
      errors.push(err);
    }

    // but if a label is specified, just log the strategy failed
    if (dontLogErrors !== true) {
      console.error(`${label}: failed to resolve "${domainName}"`);
    }
  }

  // after total failure, log every error and throw the first one
  errors.forEach(err => {
    console.error(`  ${err.message}`);
  });
  throw errors[0];
}

async function dnsResolveTxt(zone) {
  return new Promise((resolve, reject) => {
    dns.resolveTxt(zone, (err, records) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(records);
    });
  });
}

function sendError(res) {
  const message = 'There was an issue getting the Handshake TXT record for this dLink.';
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.write(message);
  res.end();
}

module.exports = { getUsing, dnsResolveTxt, sendError };
