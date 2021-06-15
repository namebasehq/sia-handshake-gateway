const http = require('http');
const httpProxy = require('http-proxy');

const contentHashStrategies = require('./strategies');
const logger = require('./logger');
const {
  errorContentHash,
  port,
  siaPrefix,
  siaGateway,
  arweavePrefix,
  arweaveGateway,
} = require('./config');
const { getUsing, sendError }  = require('./helpers');

function main() {
  try {
    const proxy = httpProxy.createProxyServer({ secure: false });
    const server = http.createServer(handler(proxy));
    console.log(`Listening on port ${port}...`);
    server.listen(port);
  } catch (err) {
    logger.error('\n--- Unexpected top level error ---');
    logger.error(err);
    logger.error('--- Unexpected top level error ---\n');
    throw err;
  }
}

function handler(proxy) {
  return async (req, res) => {
    // first, try to get the content hash
    const domainName = req.headers.host;
    let hash = errorContentHash;
    try {
      hash = await getUsing(contentHashStrategies, domainName);
    } catch (err) {
      // pass, errors have already been logged
    }

    // then, try to proxy to that content on the correct gateway
    let gateway = null;
    let rawHash = null;
    if (hash.startsWith(arweavePrefix)) {
      gateway = arweaveGateway;
      rawHash = hash.substring(arweavePrefix.length);
    } else {
      gateway = siaGateway;
      rawHash = hash.substring(siaPrefix.length);
    }
    
    try {
      logger.info(`Proxying ${domainName} => ${hash}\n`);
      proxy.web(req, res, {
        followRedirects: gateway === arweaveGateway,
        target: `${gateway}/${rawHash}`,
      });
    } catch (err) {
      logger.error(err);
      sendError(res);
    }
  }
}

main();
