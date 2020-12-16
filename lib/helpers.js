const dns = require('dns');
const {
  dnsAttemptDelayMs,
  dnsGateway,
  maxDnsAttempts,
  siaPrefix,
  txtPrefix,
} = require('./config');

async function getContentHash(domainName) {
  const zone = `${txtPrefix}.${domainName}.${dnsGateway}`;
  const errors = [];
  for (let i = 0; i < maxDnsAttempts; i++) {
    try {
      const hash = await getContentHashOnce(zone);
      return hash;
    } catch (err) {
      console.error(`Attempt #${i} failed to resolve ${zone}`);
      errors.push(err);
    }

    await sleep(dnsAttemptDelayMs);
  }

  // since maxDnsAttempts >= 1, if we haven't returned, then errors.length > 0
  throw errors[0];
}

async function getContentHashOnce(zone) {
  const records = await dnsResolveTxt(zone);

  // dns related error
  if (
    !Array.isArray(records) || records.length === 0 ||
    !Array.isArray(records[0]) || records[0].length === 0 ||
    typeof records[0][0] !== 'string' ||
    !records[0][0].startsWith(siaPrefix)
  ) {
    throw new Error(`Error retrieving TXT records for ${zone}.`);
  }

  // success
  const hash = records[0][0].substring(siaPrefix.length);
  return hash;
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

async function sleep(durationMs) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, durationMs);
  });
}

function sendError(res) {
  const message = 'There was an issue getting the Handshake TXT record for this dLink.';
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.write(message);
  res.end();
}

module.exports = { getContentHash, sendError };
