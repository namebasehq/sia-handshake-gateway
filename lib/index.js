const http = require('http');
const httpProxy = require('http-proxy');
const { siaGateway } = require('./config');
const { getContentHash, sendError }  = require('./helpers');

const PORT = 3000; // TODO env var

function main() {
  const proxy = httpProxy.createProxyServer({ secure: false });
  const server = http.createServer(handler(proxy));
  server.listen(PORT);
}

function handler(proxy) {
  return async (req, res) => {
    try {
      const domainName = req.headers.host;
      const hash = await getContentHash(domainName);
      proxy.web(req, res, { target: `${siaGateway}/${hash}` });
    } catch (err) {
      console.error(err);
      sendError(res);
    }
  }
}

main();
