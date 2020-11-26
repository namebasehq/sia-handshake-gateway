const dns = require('dns');
const { dnsGateway, siaPrefix, txtPrefix } = require('./config');

async function getContentHash(domainName) {
  return new Promise((resolve, reject) => {
    dns.resolveTxt(`${txtPrefix}.${domainName}.${dnsGateway}`, (err, records) => {
      if (
        records.length === 0 ||
        records[0].length === 0 ||
        !records[0][0].startsWith(siaPrefix)
      ) {
        reject(null);
      } else {
        const hash = records[0][0].substring(siaPrefix.length);
        resolve(hash);
      }
    });
  });
}

function sendError(res) {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.write('Unexpected request format.');
  res.end();
}

module.exports = { getContentHash, sendError };
