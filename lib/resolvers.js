const cache = require('./cache');
const hosts = require('./hosts');
const { dnsGateway, siaPrefix, arweavePrefix, txtPrefix } = require('./config');
const { hdnsResolveTxt, dnsResolveTxt, nameserverResolveTxt } = require('./helpers');

async function getContentHashFromHosts(domainName) {
  if (Object.keys(hosts).includes(domainName)) {
    return hosts[domainName];
  }

  return null;
}

async function getContentHashFromHdns(domainName) {
  const zone = `${txtPrefix}.${domainName}`;
  return getContentHashFromDns(hdnsResolveTxt, domainName, zone);
}

async function getContentHashFromHsd(domainName) {
  const zone = `${txtPrefix}.${domainName}.${dnsGateway}`;
  return getContentHashFromDns(dnsResolveTxt, domainName, zone);
}

async function getContentHashFromNameserver(domainName) {
  const zone = `${txtPrefix}.${domainName}`;
  return getContentHashFromDns(nameserverResolveTxt, domainName, zone);
}

async function getContentHashFromDns(resolver, domainName, zone) {
  const records = await resolver(zone);

  // dns related error
  if (
    !Array.isArray(records) || records.length === 0 ||
    !Array.isArray(records[0]) || records[0].length === 0 ||
    typeof records[0][0] !== 'string' ||
    (
      !records[0][0].startsWith(siaPrefix) &&
      !records[0][0].startsWith(arweavePrefix)
    )
  ) {
    throw new Error(`Error retrieving TXT records for ${zone}.`);
  }

  // success
  const hash = records[0][0];
  cache.setKey(domainName, hash);
  return hash;
}

async function getContentHashFromCache(domainName) {
  const maybeHash = cache.getKey(domainName);
  return maybeHash;
}

module.exports = {
  getContentHashFromHosts,
  getContentHashFromHdns,
  getContentHashFromHsd,
  getContentHashFromNameserver,
  getContentHashFromCache,
};
