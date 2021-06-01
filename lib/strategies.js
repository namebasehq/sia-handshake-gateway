const {
  getContentHashFromHosts,
  getContentHashFromHdns,
  getContentHashFromHsd,
  getContentHashFromCache,
  getContentHashFromNameserver,
} = require('./resolvers');
const {
  dnsAttemptDelayMs,
  maxAdditionalDnsAttempts,
} = require('./config');

const dontLogErrors = true;

// the following strategies resolve a content hash from a domain name
const strategies = [
  // 1. attempt to read the zone from the hosts file
  ['hosts', getContentHashFromHosts, dontLogErrors],

  // 2. do a dns lookup using hdns
  ['hdns', getContentHashFromHdns],

  // 3. do a normal hsd dns lookup
  ['hsd #0', getContentHashFromHsd],

  // 4. read from the nameserver
  ['nameserver', getContentHashFromNameserver],

  // 5. attempt to read from the stale cache
  ['cache', getContentHashFromCache],

  // 6. last ditch attempt: retry dns a couple times, with a delay
  ...multiply(
    maxAdditionalDnsAttempts,
    index => `hsd #${index + 1}`,
    async domainName => {
      await sleep(dnsAttemptDelayMs);
      return getContentHashFromHsd(domainName);
    }
  ),
];

function multiply(count, makeLabel, strategy) {
  const strategies = [];
  for (let i = 0; i < count; i++) {
    strategies.push([makeLabel(i), strategy]);
  }
  return strategies;
}

async function sleep(durationMs) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, durationMs);
  });
}

module.exports = strategies;
