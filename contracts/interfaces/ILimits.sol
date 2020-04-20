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
    
    function getLimits() external view returns 
    (uint[10] memory);

    function getMinHostTransactionValue() external view returns (uint);
    function getMaxHostTransactionValue() external view returns (uint);
    function getDayHostMaxLimit() external view returns (uint);
    function getDayHostMaxLimitForOneAddress() external view returns (uint);
    function getMaxHostPendingTransactionLimit() external view returns (uint);
    function getMinGuestTransactionValue() external view returns (uint);
    function getMaxGuestTransactionValue() external view returns (uint);
    function getDayGuestMaxLimit() external view returns (uint);
    function getDayGuestMaxLimitForOneAddress() external view returns (uint);
    function getMaxGuestPendingTransactionLimit() external view returns (uint); 
}