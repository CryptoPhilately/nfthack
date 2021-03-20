// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import {ICollections, IStamps, IMerkle} from "./Interfaces.sol";
import './Stamps.sol';
import '@openzeppelin/contracts/presets/ERC721PresetMinterPauserAutoId.sol';

contract Collections is ERC721 {

    using SafeMath for uint256;

    uint256 _currentTokenId = 0;
    IMerkle Merkle;
    struct Collection {
        bytes32 root;
        uint256 value;
        address stampsContract;
        bool nominated;
    }

    mapping(uint256 => mapping(bytes32 => bool)) detachedItems;
    mapping (uint256 => Collection) collections;

    event CollectionCreated(uint256 indexed tokenId, IStamps indexed stampsContract);

    constructor(string memory name, string memory symbol, IMerkle merkle) ERC721(name, symbol) {
        Merkle = merkle;
    }

    function createCollection(string memory name, string memory symbol, uint256 value, bytes32 root, string calldata URI) external  {
        _mint(msg.sender, _currentTokenId);
        _setTokenURI(_currentTokenId, URI);

        // Replace on proxy
        // Concat global prefix with symbols
        IStamps stampsContract = new Stamps(name, symbol, value != 0 );

        collections[_currentTokenId] = Collection({
            root: root,
            value: value,
            stampsContract: address(stampsContract),
            nominated: (value != 0)
        });

        emit CollectionCreated(_currentTokenId, stampsContract);

        _currentTokenId++;
    }

    function detachItem(uint256 collectionId, uint256 denomination, string calldata itemURI, bytes calldata proof) external  {
        bytes32 itemHash = keccak256(abi.encodePacked(denomination, itemURI));
        Collection storage collection = collections[collectionId];
        require(_isApprovedOrOwner(msg.sender, collectionId), "");
        require(Merkle.verifyProof(itemHash, collection.root, proof), "");

        if (collection.nominated) {
            collection.value = collection.value.sub(denomination);
        }

        detachedItems[collectionId][itemHash] = true;
        IStamps(collection.stampsContract).mint(denomination, itemURI);
    }

    function joinItem( uint256 collectionId, uint256 itemId) external  {
        Collection storage collection = collections[collectionId];
        uint256 stampDenomination = IStamps(collection.stampsContract).getDenomination(itemId);
        string memory stampURI = IStamps(collection.stampsContract).tokenURI(itemId);
        bytes32 itemHash = keccak256(abi.encodePacked(stampDenomination, stampURI));
        require(detachedItems[collectionId][itemHash], "");

        if (collection.nominated == true) {
            collection.value = collection.value.add(stampDenomination);
        }

        detachedItems[collectionId][itemHash] = false;
        IStamps(collection.stampsContract).burn(itemId);
    }

}
