const cache = require('./cache');
const hosts = require('./hosts');
const { dnsGateway, siaPrefix, txtPrefix } = require('./config');
const { dnsResolveTxt } = require('./helpers');

async function getContentHashFromHosts(domainName) {
  if (Object.keys(hosts).includes(domainName)) {
    return hosts[domainName];
  }

  return null;
}

async function getContentHashFromHsd(domainName) {
  const zone = `${txtPrefix}.${domainName}.${dnsGateway}`;
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
  cache.setKey(domainName, hash);
  return hash;
}

async function getContentHashFromCache(domainName) {
  const maybeHash = cache.getKey(domainName);
  return maybeHash;
}

module.exports = {
  getContentHashFromHosts,
  getContentHashFromHsd,
  getContentHashFromCache,
};
