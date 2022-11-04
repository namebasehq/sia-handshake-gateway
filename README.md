Sia/Handshake gateway
==

This gateway uses hsd.zone and siasky.net to load Sia websites from Handshake names.

In contrast to https://github.com/namebasehq/decentralized-static, which solves the same problem, this solution is high-trust. High trust in the sense that it relies on trusted third parties to function. Instead of running a Handshake resolver, this gateway trusts hsd.zone (which Namebase operates). Instead of running a Sia full node to retrieve content, it trusts siasky.net.

This significantly reduces complexity, so it should hopefully be easier to maintain.

NOTE: this is not ready for actual production usage. Was mostly an experiment to see how easy it would be to do this.

## TODOs before production

1. Add logging
2. Automatically deploy
3. Don't crash if there is an unexpected error

## Docs

Currently deployed at sia.namebase.io. To use it, set the following two records:

```
CNAME   a.b.ZONE                sia.namebase.io
TXT     _contenthash.a.b.ZONE   sia://CONTENT_HASH_HERE
```

When your browser requests sia.namebase.io with the host a.b.ZONE, the gateway will:

1. Do a DNS lookup for TXT records at _contenthash.a.b.ZONE.hsd.zone to get the sia content hash
2. Proxy the request to https://siasky.net/CONTENT_HASH

## Development

```bash
$(npm bin)/pm2 start all

# these next two are only needed the first time if you want to run on restart
$(npm bin)/pm2 save
$(npm bin)/pm2 startup
```
