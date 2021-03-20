const Collections = artifacts.require("Collections");
const Stamps = artifacts.require("Stamps");
const Depository = artifacts.require("Depository");

contract("Collections", (accounts) => {
  const collectionURI = "ipfs://";
  var collectionContract;
  before("init", async () => {
    collectionContract = await Collections.deployed();
  });

  describe("Create a collection", () => {
    it("Should create a collection", async () => {
      const merkleRoot = web3.utils.randomHex(32);
      const tx = await collectionContract.createCollection(
        "MyStamps",
        "MYSP",
        10,
        merkleRoot,
        collectionURI
      );
    });
  });
});
