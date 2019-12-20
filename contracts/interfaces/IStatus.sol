pragma solidity ^0.5.12;

contract IStatus {
    
    function pauseBridgeByVolume() external;
    function resumeBridgeByVolume() external;
    function pausedByBridgeVolumeForAddress(address sender) external;
    function resumedByBridgeVolumeForAddress(address sender) external;
    function setPausedStatusForGuestAddress(bytes32 sender) external;
    function setResumedStatusForGuestAddress(bytes32 sender) external;

    function startBridge() external;
    function resumeBridge() external;
    function stopBridge() external;
    function pauseBridge() external;
    function getStatusBridge() external view returns(uint);
    function getStatusForAccount(address account) external view returns(bool);
    function isPausedByBridgVolume() public view returns(bool);
}