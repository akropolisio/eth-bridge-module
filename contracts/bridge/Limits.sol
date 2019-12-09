pragma solidity ^0.5.12;

import "../third-party/BokkyPooBahsDateTimeLibrary.sol";
import "../interfaces/ILimits.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/*
 add contructor for initialize
*/

contract Limits is ILimits, Initializable {

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

    BridgeLimits public limits;
    
    function setLimits(uint minHostTransactionValue,
    uint maxHostTransactionValue,
    uint dayHostMaxLimit,
    uint dayHostMaxLimitForOneAddress,
    uint maxHostPendingTransactionLimit,
    uint minGuestTransactionValue,
    uint maxGuestTransactionValue,
    uint dayGuestMaxLimit,
    uint dayGuestMaxLimitForOneAddress,
    uint maxGuestPendingTransactionLimit) external {
        limits.minHostTransactionValue = minHostTransactionValue;
        limits.maxHostTransactionValue = maxHostTransactionValue;
        limits.dayHostMaxLimit = dayHostMaxLimit;
        limits.dayHostMaxLimitForOneAddress = dayHostMaxLimitForOneAddress;
        limits.maxHostPendingTransactionLimit = maxHostPendingTransactionLimit;

        limits.minGuestTransactionValue = minGuestTransactionValue;
        limits.maxGuestTransactionValue = maxGuestTransactionValue;
        limits.dayGuestMaxLimit = dayGuestMaxLimit;
        limits.dayGuestMaxLimitForOneAddress = dayGuestMaxLimitForOneAddress;
        limits.maxGuestPendingTransactionLimit = maxGuestPendingTransactionLimit;

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

    /*limit getter */
    function getLimits() external view returns 
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
  
    function initialize() initializer public {
        init();
    }

    function init() internal {
        limits = BridgeLimits(10*10**18, 
                              100*10**18, 
                              200*10**18, 
                              50*10**18, 
                              400*10**18, 
                              10*10**18,
                              100*10**18,
                              200*10**18,
                              50*10**18,
                              400*10**18
                              );
      
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