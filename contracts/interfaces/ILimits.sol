pragma solidity ^0.5.12;

contract ILimits {

    function setLimits(uint minHostTransactionValue,
    uint maxHostTransactionValue,
    uint dayHostMaxLimit,
    uint dayHostMaxLimitForOneAddress,
    uint maxHostPendingTransactionLimit,
    uint minGuestTransactionValue,
    uint maxGuestTransactionValue,
    uint dayGuestMaxLimit,
    uint dayGuestMaxLimitForOneAddress,
    uint maxGuestPendingTransactionLimit) external;

    function init() external;
    
    function getLimits() external view returns 
    (uint, uint, uint, uint, uint, uint, uint, uint, uint, uint);

    
}