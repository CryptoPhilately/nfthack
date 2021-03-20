const fs = require('fs')
const Collections = artifacts.require("Collections");
const Merkle = artifacts.require("Merkle");

module.exports = function (deployer) {
  deployer.then(async () => {
    await deployer.deploy(Merkle);
    const contract = await deployer.deploy(
      Collections,
      "CryptoPhilately",
      "PHIL",
      Merkle.address
    );

    const { abi } = require('../build/contracts/Collections.json')

    fs.writeFileSync('./src/config/CollectionsABI.json', JSON.stringify(abi))
    fs.writeFileSync('./src/config/ColletionsLocalAddress.json', JSON.stringify({ address: contract.address }))
  });
};
