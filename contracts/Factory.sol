// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;


import {IFactory} from "./Interfaces.sol";
import './Stamps.sol';
import './Depository.sol';

contract Factory is IFactory {

    constructor() {

    }

    function createStampContract(string memory name, string memory symbol, bool nominated) external override returns(IStamps) {
        return new Stamps(name, symbol, nominated, msg.sender, IFactory(address(this)));
    }

    function createDepositoryContract(string memory name, string memory symbol, address collectionContract) external override returns(IDepository) {
        return new Depository(name, symbol, collectionContract, msg.sender);
    }

}
