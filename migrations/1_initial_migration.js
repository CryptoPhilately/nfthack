const Collections = artifacts.require("Collections");
const Merkle = artifacts.require("Merkle");

module.exports = function (deployer) {
  deployer.then(async () => {
    await deployer.deploy(Merkle);
    await deployer.deploy(
      Collections,
      "CryptoPhilately",
      "PHIL",
      Merkle.address
    );
  });
};
