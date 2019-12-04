pragma solidity ^0.5.12;

import "../third-party/BokkyPooBahsDateTimeLibrary.sol";
import "../interfaces/ILimits.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/*
 add contructor for initialize
*/

contract Limits is ILimits {

     struct BridgeLimits {
        //ETH Limits
        uint minHostTransactionValue;
        uint maxHostTransactionValue;
        uint dayHostMaxLimit;
        uint dayHostMaxLimitForOneAddress;
        uint maxHostPendingTransactionLimit;
        //ETH Limits
        uint minGuestTransactionValue;
        uint maxGuestTransactionValue;
        uint dayGuestMaxLimit;
        uint dayGuestMaxLimitForOneAddress;
        uint maxGuestPendingTransactionLimit;
    }

    event SetNewLimits(
    uint minHostTransactionValue,
    uint maxHostTransactionValue,
    uint dayHostMaxLimit,
    uint dayHostMaxLimitForOneAddress,
    uint maxHostPendingTransactionLimit,
    uint minGuestTransactionValue,
    uint maxGuestTransactionValue,
    uint dayGuestMaxLimit,
    uint dayGuestMaxLimitForOneAddress,
    uint maxGuestPendingTransactionLimit);

    BridgeLimits internal limits;
    
    function setLimits(uint minHostTransactionValue,
    uint maxHostTransactionValue,
    uint dayHostMaxLimit,
    uint dayHostMaxLimitForOneAddress,
    uint maxHostPendingTransactionLimit,
    uint minGuestTransactionValue,
    uint maxGuestTransactionValue,
    uint dayGuestMaxLimit,
    uint dayGuestMaxLimitForOneAddress,
    uint maxGuestPendingTransactionLimit) public {
      
    }

    /*limit getter */
    function getLimits() public view returns 
    (uint, uint, uint, uint, uint, uint, uint, uint, uint, uint) {
        return (
          limits.minHostTransactionValue,
          limits.maxHostTransactionValue,
          limits.dayHostMaxLimit,
          limits.dayHostMaxLimitForOneAddress,
          limits.maxHostPendingTransactionLimit,
        //ETH Limits
          limits.minGuestTransactionValue,
          limits.maxGuestTransactionValue,
          limits.dayGuestMaxLimit,
          limits.dayGuestMaxLimitForOneAddress,
          limits.maxGuestPendingTransactionLimit
        );
    }

    function init() internal {
        limits.minHostTransactionValue = 10*10**18;
        limits.maxHostTransactionValue = 100*10**18;
        limits.dayHostMaxLimit = 200*10**18;
        limits.dayHostMaxLimitForOneAddress = 50*10**18;
        limits.maxHostPendingTransactionLimit = 400*10**18;

        limits.minGuestTransactionValue = 10*10**18;
        limits.maxGuestTransactionValue = 100*10**18;
        limits.dayGuestMaxLimit = 200*10**18;
        limits.dayGuestMaxLimitForOneAddress = 50*10**18;
        limits.maxGuestPendingTransactionLimit = 400*10**18;

        emit SetNewLimits(
          limits.minHostTransactionValue, 
          limits.maxHostTransactionValue, 
          limits.dayHostMaxLimit,
          limits.dayHostMaxLimitForOneAddress,
          limits.maxHostPendingTransactionLimit,
          limits.minGuestTransactionValue,
          limits.maxGuestTransactionValue,
          limits.dayGuestMaxLimit,
          limits.dayGuestMaxLimitForOneAddress,
          limits.maxGuestPendingTransactionLimit 
        );
    }
}