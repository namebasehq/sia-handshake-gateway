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
  ipfsPrefix,
  ipfsGateway,
} = require('./config');
const { getUsing, sendError }  = require('./helpers');

function main() {
  try {
    const proxy = httpProxy.createProxyServer({ secure: false, changeOrigin: true });
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
    } else if (hash.startsWith(ipfsPrefix)) {
      gateway = ipfsGateway;
      rawHash = hash.substring(ipfsPrefix.length);
    } else {
      gateway = siaGateway;
      rawHash = hash.substring(siaPrefix.length);
    }

    try {
      const url = `${gateway}/${rawHash}`;
      logger.info(`Proxying ${domainName} => ${url}\n`);

      const useIframe = true;
      if (useIframe) {
        res.writeHeader(200, { "Content-Type": "text/html" });
        res.write(`
<body style="margin: 0; padding: 0;">
<iframe src="${url}" frameborder="0" style="overflow:hidden; height:100%; width:100%" height="100%" width="100%"></iframe>
</body>
`);
        res.end();
      } else {
        proxy.web(req, res, {
          followRedirects: gateway === arweaveGateway,
          target: url,
        });
      }
    } catch (err) {
      logger.error(err);
      sendError(res);
    }
  }
}

main();
