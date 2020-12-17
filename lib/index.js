const http = require('http');
const httpProxy = require('http-proxy');

const contentHashStrategies = require('./strategies');
const { errorContentHash, port, siaGateway } = require('./config');
const { getUsing, sendError }  = require('./helpers');

function main() {
  const proxy = httpProxy.createProxyServer({ secure: false });
  const server = http.createServer(handler(proxy));
  server.listen(port);
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

    // then, try to proxy to that content on sia
    try {
      console.log(`Proxying ${domainName} => ${hash}\n`);
      proxy.web(req, res, { target: `${siaGateway}/${hash}` });
    } catch (err) {
      console.error(err);
      sendError(res);
    }
  }
}

main();
