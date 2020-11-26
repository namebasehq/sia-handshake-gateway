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

## Running

```bash
npm run start
```

## License

Closed source for now
