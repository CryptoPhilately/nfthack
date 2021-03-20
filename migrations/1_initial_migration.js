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

    fs.writeFileSync('./src/config/contract_address.txt', contract.address)
  });
};
