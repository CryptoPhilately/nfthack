const fs = require("fs");
const Collections = artifacts.require("Collections");
const Merkle = artifacts.require("Merkle");
const Factory = artifacts.require("Factory");

module.exports = function (deployer) {
  deployer.then(async () => {
    await deployer.deploy(Merkle);
    await deployer.deploy(Factory);
    const contract = await deployer.deploy(
      Collections,
      "CryptoPhilately",
      "PHIL",
      Merkle.address,
      Factory.address
    );

    const { abi: stampsAbi } = require("../build/contracts/Stamps.json");
    const { abi: depositoryAbi } = require("../build/contracts/Depository.json");
    const { abi: collectionsAbi } = require("../build/contracts/Collections.json");

    fs.writeFileSync("./src/config/CollectionsABI.json", JSON.stringify(collectionsAbi));
    fs.writeFileSync("./src/config/DepositoryABI.json", JSON.stringify(depositoryAbi));
    fs.writeFileSync("./src/config/StampsABI.json", JSON.stringify(stampsAbi));

    fs.writeFileSync("./src/config/ColletionsLocalAddress.json", JSON.stringify({ address: contract.address }));
  });
};
