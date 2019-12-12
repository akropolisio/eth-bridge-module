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

    BridgeLimits public parameters;
    
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
        parameters.minHostTransactionValue = minHostTransactionValue;
        parameters.maxHostTransactionValue = maxHostTransactionValue;
        parameters.dayHostMaxLimit = dayHostMaxLimit;
        parameters.dayHostMaxLimitForOneAddress = dayHostMaxLimitForOneAddress;
        parameters.maxHostPendingTransactionLimit = maxHostPendingTransactionLimit;

        parameters.minGuestTransactionValue = minGuestTransactionValue;
        parameters.maxGuestTransactionValue = maxGuestTransactionValue;
        parameters.dayGuestMaxLimit = dayGuestMaxLimit;
        parameters.dayGuestMaxLimitForOneAddress = dayGuestMaxLimitForOneAddress;
        parameters.maxGuestPendingTransactionLimit = maxGuestPendingTransactionLimit;

        emit SetNewLimits(
          parameters.minHostTransactionValue, 
          parameters.maxHostTransactionValue, 
          parameters.dayHostMaxLimit,
          parameters.dayHostMaxLimitForOneAddress,
          parameters.maxHostPendingTransactionLimit,
          parameters.minGuestTransactionValue,
          parameters.maxGuestTransactionValue,
          parameters.dayGuestMaxLimit,
          parameters.dayGuestMaxLimitForOneAddress,
          parameters.maxGuestPendingTransactionLimit 
        );
    }

    /*limit getter */
    function getLimits() external view returns 
    (uint, uint, uint, uint, uint, uint, uint, uint, uint, uint) {
        return (
          parameters.minHostTransactionValue,
          parameters.maxHostTransactionValue,
          parameters.dayHostMaxLimit,
          parameters.dayHostMaxLimitForOneAddress,
          parameters.maxHostPendingTransactionLimit,
        //ETH Limits
          parameters.minGuestTransactionValue,
          parameters.maxGuestTransactionValue,
          parameters.dayGuestMaxLimit,
          parameters.dayGuestMaxLimitForOneAddress,
          parameters.maxGuestPendingTransactionLimit
        );
    }
  
    function initialize() initializer public {
        init();
    }

    function init() internal {
        parameters = BridgeLimits(10*10**18, 
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
          parameters.minHostTransactionValue, 
          parameters.maxHostTransactionValue, 
          parameters.dayHostMaxLimit,
          parameters.dayHostMaxLimitForOneAddress,
          parameters.maxHostPendingTransactionLimit,
          parameters.minGuestTransactionValue,
          parameters.maxGuestTransactionValue,
          parameters.dayGuestMaxLimit,
          parameters.dayGuestMaxLimitForOneAddress,
          parameters.maxGuestPendingTransactionLimit  
        );
    }
}