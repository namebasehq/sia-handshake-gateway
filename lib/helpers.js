const dns = require('dns');
const { dnsGateway, siaPrefix, txtPrefix } = require('./config');

async function getContentHash(domainName) {
  return new Promise((resolve, reject) => {
    dns.resolveTxt(`${txtPrefix}.${domainName}.${dnsGateway}`, (err, records) => {
      // unexpected error
      if (err) {
        reject(err);
        return;
      }

      // dns related error
      if (
        !Array.isArray(records) || records.length === 0 ||
        !Array.isArray(records[0]) || records[0].length === 0 ||
        typeof records[0][0] !== 'string' ||
        !records[0][0].startsWith(siaPrefix)
      ) {
        reject(null);
        return;
      }

      // success
      const hash = records[0][0].substring(siaPrefix.length);
      resolve(hash);
    });
  });
}

function sendError(res) {
  const message = 'There was an issue getting the Handshake TXT record for this dLink.';
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.write(message);
  res.end();
}

module.exports = { getContentHash, sendError };
