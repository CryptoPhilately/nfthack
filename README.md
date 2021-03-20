# NFT Posts stamps collections

DApp for tokenize post stamps - https://nft-collections.web.app


## Development
App writes in vanillaJS / typescript with native web-components.
For work with ethereum network app use [metamask api](https://docs.metamask.io/guide/).

We use [esbuild](https://esbuild.github.io/) for compile .ts/.js files and [stylus](https://stylus-lang.com/) for css.
[Browsersync](https://www.browsersync.io/) as local dev server.
See `./scripts` folder.

### Run dev mode
Start frontend
```
npm start
```

Start test network
```
npm run testnet # copy and import provate key to metamask
npm run migrate # deploy contracts to local network
```
Use local rpc `localhost::8545` in metamask


### Build frontend
```
npm run build
```
