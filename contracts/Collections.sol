// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ICollections, IStamps, IMerkle, IFactory} from "./Interfaces.sol";
import '@openzeppelin/contracts/math/SafeMath.sol';
import './Stamps.sol';

contract Collections is ICollections, ERC721 {

    using SafeMath for uint256;

    uint256 _currentTokenId = 0;

    IMerkle Merkle;
    IFactory Factory;

    struct Collection {
        bytes32 root;
        uint256 value;
        address stampsContract;
        bool nominated;
    }

    mapping(uint256 => mapping(bytes32 => bool)) public detachedItems;
    mapping(uint256 => Collection) public collections;

    event CollectionCreated(uint256 indexed tokenId, IStamps indexed stampsContract);

    constructor(string memory name, string memory symbol, IMerkle merkle, IFactory factory) ERC721(name, symbol) {
        Merkle = merkle;
        Factory = factory;
    }

    function createCollection(string memory name, string memory symbol, uint256 value, bytes32 root, string calldata URI) external override {
        _mint(msg.sender, _currentTokenId);
        _setTokenURI(_currentTokenId, URI);

        IStamps stampsContract = Factory.createStampContract(name, symbol, value != 0);

        collections[_currentTokenId] = Collection({
            root: root,
            value: value,
            stampsContract: address(stampsContract),
            nominated: (value != 0)
        });

        emit CollectionCreated(_currentTokenId, stampsContract);

        _currentTokenId++;
    }

    function detachItem(uint256 collectionId, uint256 denomination, string calldata itemURI, bytes calldata proof) external override {
        bytes32 itemHash = keccak256(abi.encodePacked(denomination, itemURI));
        Collection storage collection = collections[collectionId];
        require(_isApprovedOrOwner(msg.sender, collectionId), "sender is not a owner");
        require(Merkle.verifyProof(itemHash, collection.root, proof), "Invalid proof");

        if (collection.nominated) {
            collection.value = collection.value.sub(denomination);
        }

        detachedItems[collectionId][itemHash] = true;
        IStamps(collection.stampsContract).mint(denomination, itemURI, msg.sender);
    }

    function joinItem(uint256 collectionId, uint256 itemId) external override {
        Collection storage collection = collections[collectionId];
        uint256 stampDenomination = IStamps(collection.stampsContract).getDenomination(itemId);
        string memory stampURI = IStamps(collection.stampsContract).tokenURI(itemId);
        bytes32 itemHash = keccak256(abi.encodePacked(stampDenomination, stampURI));
        require(detachedItems[collectionId][itemHash], "The item is not detached");

        if (collection.nominated == true) {
            collection.value = collection.value.add(stampDenomination);
        }

        detachedItems[collectionId][itemHash] = false;
        IStamps(collection.stampsContract).burn(itemId);
    }

    function getDenomination(uint256 tokenId) external view override returns(uint256) {
        return collections[tokenId].value;
    }

    function getStampsContract(uint256 tokenId) external view returns(address) {
        return collections[tokenId].stampsContract;
    }

    function getDepositoryContract(uint256 tokenId) external view returns(address) {
        return IStamps(collections[tokenId].stampsContract).getDepository();
    }

}
