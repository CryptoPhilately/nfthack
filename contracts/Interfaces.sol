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

interface ICollections  {
    function createCollection(string memory name, string memory symbol, uint256 value, bytes32 root, string calldata URI) external;
    function detachItem(uint256 collectionId, uint256 denomination, string calldata stampURI, bytes calldata proof) external;
    function joinItem(uint256 collectionId, uint256 tokenId) external;
    function verifyProof(bytes32 leaf, bytes32 root, bytes memory proof) external returns (bool);
}

interface IStamps is IERC721Metadata {
    function mint(uint256 stampDenomination, string calldata URI) external returns(uint256);
    function burn(uint256 tokenId) external;
    function getDenomination(uint256 tokenId) external returns(uint256);
}


interface IDepository is IERC20 {

}
