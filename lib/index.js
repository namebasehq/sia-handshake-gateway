const http = require('http');
const httpProxy = require('http-proxy');
const hosts = require('./hosts');
const { siaGateway, errorContentHash } = require('./config');
const { getContentHash, sendError }  = require('./helpers');

const PORT = 3000; // TODO env var

function main() {
  const proxy = httpProxy.createProxyServer({ secure: false });
  const server = http.createServer(handler(proxy));
  server.listen(PORT);
}

function handler(proxy) {
  return async (req, res) => {
    // first, try to get the content hash
    const domainName = req.headers.host;
    let hash = errorContentHash;
    if (Object.keys(hosts).includes(domainName)) {
      hash = hosts[domainName];
    } else {
      try {
        hash = await getContentHash(domainName);
      } catch (err) {
        console.error(err);
      }
    }

    // then, try to proxy to that content on sia
    try {
      console.log(`Proxying ${domainName} => ${hash}`);
      proxy.web(req, res, { target: `${siaGateway}/${hash}` });
    } catch (err) {
      console.error(err);
      sendError(res);
    }
  }
}

main();
