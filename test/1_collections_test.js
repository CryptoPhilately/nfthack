const Collections = artifacts.require("Collections");
const Stamps = artifacts.require("Stamps");
const Depository = artifacts.require("Depository");

var collectionContract, stampsContract, depositoryContract;

contract("Collections", ([user]) => {
  const collectionURI = "ipfs://";

  const items = [
    {
      name: "stamps_1",
      description: "...",
      denomination: 25,
      file: "ipfs://stamp_img_1",
      URI: "ipfs://stampURI_1",
    },
    {
      name: "stamps_2",
      description: "...",
      denomination: 25,
      file: "ipfs://stamp_img_2",
      URI: "ipfs://stampURI_2",
    },
    {
      name: "stamps_3",
      description: "...",
      denomination: 25,
      file: "ipfs://stamp_img_3",
      URI: "ipfs://stampURI_3",
    },
    {
      name: "stamps_4",
      description: "...",
      denomination: 25,
      file: "ipfs://stamp_img_4",
      URI: "ipfs://stampURI_4",
    },
  ];

  before("init", async () => {
    collectionContract = await Collections.deployed();
  });

  describe("Create a collection", () => {
    let collectionId, MerkleTree;
    it("Should create a collection", async () => {
      // MerkleTree = MerkleTree.generateTree(items)
      const merkleRoot = web3.utils.randomHex(32);
      const tx = await collectionContract.createCollection(
        "MyStamps",
        "MYSP",
        10,
        merkleRoot,
        collectionURI
      );
      collectionId = tx.receipt.logs[0].args.tokenId;
      const stampsAddress = tx.receipt.logs[1].args.stampsContract;
      console.log(
        `
        collectionId: ${collectionId}
        stamps: ${stampsAddress}
        `
      );
    });
    it("Should get the collection data", async () => {
      const _collectionId = await collectionContract.tokenOfOwnerByIndex.call(
        user,
        0
      );
      const collection = await collectionContract.collections.call(
        _collectionId
      );
      console.log(
        `Collection #${_collectionId}:
        root: ${collection.root}
        value: ${collection.value.toString()}
        stamps: ${collection.stampsContract}
        nominated: ${collection.nominated}
        `
      );
    });
  });

  describe("Detach and join a item", () => {
    let collectionId, itemId;
    it("Should create a collection", async () => {
      // MerkleTree = MerkleTree.generateTree(items)
      const merkleRoot = web3.utils.randomHex(32);
      const tx = await collectionContract.createCollection(
        "MyStamps",
        "MYSP",
        100,
        merkleRoot,
        collectionURI
      );
      collectionId = tx.receipt.logs[0].args.tokenId;
      const stampsAddress = tx.receipt.logs[1].args.stampsContract;
      console.log(
        `
        collectionId: ${collectionId}
        stamps: ${stampsAddress}
        `
      );
      stampsContract = await Stamps.at(stampsAddress);
    });
    it("Should detach a item", async () => {
      const item = items[0];
      // const itemHash = web3.utils.soliditySha3(item.denomination, item.URI);
      // const proof = MerkleTree.generateProof(itemHash);
      const proof = web3.utils.randomHex(320);
      await collectionContract.detachItem(
        collectionId,
        item.denomination,
        item.URI,
        proof
      );
    });
    it("Should get the item data", async () => {
      itemId = await stampsContract.tokenOfOwnerByIndex.call(user, 0);
      const denomination = await stampsContract.getDenomination(itemId);
      const URI = await stampsContract.tokenURI(itemId);
      const exists = await stampsContract.exists(itemId);
      console.log(
        `
        Stamp #${itemId}
        denomination: ${denomination}
        URI: ${URI}
        exists: ${exists}
        `
      );
    });
    it("Should join the item", async () => {
      await collectionContract.joinItem(collectionId, itemId);
      const exists = await stampsContract.exists(itemId);
      console.log(`Item exists: ${exists}`);
    });
  });

  describe("Detach and sell a item", () => {
    let collectionId, itemId;
    it("Should create a collection", async () => {
      // MerkleTree = MerkleTree.generateTree(items)
      const merkleRoot = web3.utils.randomHex(32);
      const tx = await collectionContract.createCollection(
        "MyStamps",
        "MYSP",
        100,
        merkleRoot,
        collectionURI
      );
      collectionId = tx.receipt.logs[0].args.tokenId;
      const stampsAddress = tx.receipt.logs[1].args.stampsContract;
      console.log(
        `
        collectionId: ${collectionId}
        stamps: ${stampsAddress}
        `
      );
      stampsContract = await Stamps.at(stampsAddress);
      const depositoryAddress = await stampsContract.depository.call();
      depositoryContract = await Depository.at(depositoryAddress);
    });
    it("Should detach a item", async () => {
      const item = items[0];
      // const itemHash = web3.utils.soliditySha3(item.denomination, item.URI);
      // const proof = MerkleTree.generateProof(itemHash);
      const proof = web3.utils.randomHex(320);
      await collectionContract.detachItem(
        collectionId,
        item.denomination,
        item.URI,
        proof
      );
    });
    it("Should get the item data", async () => {
      itemId = await stampsContract.tokenOfOwnerByIndex.call(user, 0);
      const denomination = await stampsContract.getDenomination(itemId);
      const URI = await stampsContract.tokenURI(itemId);
      const exists = await stampsContract.exists(itemId);
      console.log(
        `
        Stamp #${itemId}
        denomination: ${denomination}
        URI: ${URI}
        exists: ${exists}
        `
      );
    });
    it("Should deposit the item", async () => {
      await stampsContract.approve(depositoryContract.address, itemId);
      await depositoryContract.depositStamp(itemId);
      const res = await depositoryContract.balanceOf.call(user);
      console.log(`balance: ${res}`);
    });

    it("Should deposit the collection", async () => {
      await collectionContract.approve(
        depositoryContract.address,
        collectionId
      );
      await depositoryContract.depositCollection(collectionId);
      const res = await depositoryContract.balanceOf.call(user);
      console.log(`balance: ${res}`);
    });
  });
});
