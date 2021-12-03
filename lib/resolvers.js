const cache = require('./cache');
const hosts = require('./hosts');
const { dnsGateway, siaPrefix, arweavePrefix, ipfsPrefix, ipfsPrefixLegacy, txtPrefixes } = require('./config');
const { hdnsResolveTxt, dnsResolveTxt, nameserverResolveTxt } = require('./helpers');

async function getContentHashFromHosts(domainName) {
  if (Object.keys(hosts).includes(domainName)) {
    return hosts[domainName];
  }

  return null;
}

async function getContentHashFromHdns(domainName) {
  const zones = txtPrefixes.map(p => `${p}.${domainName}`);
  return getContentHashFromDns(hdnsResolveTxt, domainName, zones);
}

async function getContentHashFromHsd(domainName) {
  const zones = txtPrefixes.map(p => `${p}.${domainName}`);
  return getContentHashFromDns(dnsResolveTxt, domainName, zones);
}

async function getContentHashFromNameserver(domainName) {
  const zones = txtPrefixes.map(p => `${p}.${domainName}`);
  return getContentHashFromDns(nameserverResolveTxt, domainName, zones);
}

async function getContentHashFromDns(resolver, domainName, zones) {
  const getRecords = await Promise.allSettled(zones.map(resolver));
  const records = getRecords.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
  // dns related error
  if (
    !Array.isArray(records) || records.length === 0 ||
    !Array.isArray(records[0]) || records[0].length === 0 ||
    typeof records[0][0] !== 'string' ||
    (
      !records[0][0].startsWith(siaPrefix) &&
      !records[0][0].startsWith(arweavePrefix) &&
      !records[0][0].startsWith(ipfsPrefix) && 
      !records[0][0].startsWith(ipfsPrefixLegacy)
    )
  ) {
    throw new Error(`Error retrieving TXT records for ${zones}`);
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
