// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import { IStamps, IDepository } from './Interfaces.sol';
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Depository is IDepository, ERC20Burnable {

    address stampsContract;

     constructor(
         string memory name,
         string memory symbol
    )
        ERC20(name, symbol)
    {
        stampsContract = msg.sender;
    }

    function depositStamp(uint256 tokenId) external {
        IERC721(stampsContract).transferFrom(msg.sender, address(this), tokenId);
        uint256 denomination = IStamps(stampsContract).getDenomination(tokenId);
        _mint(msg.sender, denomination);
    }

    function buyStamp(uint256 tokenId) external {
        uint256 denomination = IStamps(stampsContract).getDenomination(tokenId);
        burnFrom(msg.sender, denomination);
        IERC721(stampsContract).transferFrom(address(this), msg.sender, tokenId);
    }

}
