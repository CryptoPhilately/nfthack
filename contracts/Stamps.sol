// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ICollections, IDepository, IFactory} from "./Interfaces.sol";
import "./Depository.sol";

contract Stamps is IStamps, ERC721 {

    address CollectionsAddress;
    IFactory Factory;
    IDepository public depository;
    bool public isNominated;

    uint256 _currentTokenId = 0;

    mapping(uint256 => uint256) denominations;

    event StampMinted(uint256 indexed _currentTokenId);

    constructor(string memory name, string memory symbol, bool nominated, address collectionAddress, IFactory factory) ERC721(name, symbol) {
        CollectionsAddress = collectionAddress;
        Factory = factory;
        if (nominated) {
            depository = Factory.createDepositoryContract(name, symbol, CollectionsAddress);
            isNominated = true;
        }
    }

    modifier onlyCollectionContract() {
        require(msg.sender == CollectionsAddress);
        _;
    }

    function mint(uint256 stampDenomination, string calldata URI, address owner) external onlyCollectionContract override returns(uint256) {
        _mint(owner, _currentTokenId);
        _setTokenURI(_currentTokenId, URI);

        if (isNominated) {
            denominations[_currentTokenId] = stampDenomination;
        } else {
            require(stampDenomination == 0, "");
        }

        emit StampMinted(_currentTokenId);

        _currentTokenId++;
        return _currentTokenId;
    }

    function burn(uint256 tokenId) external override onlyCollectionContract {
        _burn(tokenId);
    }

    function getDenomination(uint256 tokenId) external view override returns(uint256) {
        return denominations[tokenId];
    }

    function exists(uint256 tokenId) external view returns(bool) {
        return _exists(tokenId);
    }
}
