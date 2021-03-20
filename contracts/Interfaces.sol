// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface INominatedNFT {
    function getDenomination(uint256 tokenId) external view returns(uint256);
}

interface IMerkle {
    function verifyProof(bytes32 leaf, bytes32 root, bytes memory proof) external pure returns (bool);
}

interface ICollections is INominatedNFT {
    function createCollection(string memory name, string memory symbol, uint256 value, bytes32 root, string calldata URI) external;
    function detachItem(uint256 collectionId, uint256 denomination, string calldata stampURI, bytes calldata proof) external;
    function joinItem(uint256 collectionId, uint256 tokenId) external;
}

interface IStamps is INominatedNFT, IERC721Metadata {
    function mint(uint256 stampDenomination, string calldata URI, address owner) external returns(uint256);
    function burn(uint256 tokenId) external;
    function getDepository() external view returns(address);
}

interface IFactory {
    function createStampContract(string memory name, string memory symbol, bool nominated) external returns(IStamps);
    function createDepositoryContract(string memory name, string memory symbol, address collectionContract) external returns(IDepository);
}

interface IDepository is IERC20 {

}
