pragma solidity ^0.5.12;

import "../third-party/BokkyPooBahsDateTimeLibrary.sol";

contract Status {


    using BokkyPooBahsDateTimeLibrary for uint;

    /*
       Bridge pause/stop
    */
    event BridgeStarted();
    event BridgeStopped();
    event BridgeResumed();
    event BridgePaused();

    //ETH Account
    event HostAccountPausedMessage(bytes32 messageID, address sender, uint timestamp);
    event HostAccountResumedMessage(bytes32 messageID, address sender, uint timestamp);

    //guest
    event GuestAccountPausedMessage(bytes32 messageID, bytes32 recipient, uint timestamp);
    event GuestAccountResumedMessage(bytes32 messageID, bytes32 recipient, uint timestamp);

    event BridgePausedByVolume(bytes32 messageID);
    event BridgeStartedByVolume(bytes32 messageID);

    enum BridgeStatus {ACTIVE, PAUSED, STOPPED, PAUSED_BY_VOLUME, STOPPED_BY_VOLUME}

    BridgeStatus internal bridgeStatus;

    bool internal pauseBridgeByVolume;

    mapping(address => bool) internal pauseAccountByVolume;

    modifier activeBridgeStatus() {
        require(bridgeStatus == BridgeStatus.ACTIVE, "Bridge is stopped or paused");
        _;
    }

    modifier stoppedOrPausedBridgeStatus() {
        require((bridgeStatus == BridgeStatus.PAUSED || bridgeStatus == BridgeStatus.STOPPED), "Bridge is actived");
        _;
    }

    function _pauseBridgeByVolume() internal {
        pauseBridgeByVolume = true;
        bridgeStatus = BridgeStatus.PAUSED_BY_VOLUME;
        emit BridgePausedByVolume(keccak256(abi.encodePacked(now)));
    }

    function _resumeBridgeByVolume() internal {
        pauseBridgeByVolume = false;
        bridgeStatus = BridgeStatus.ACTIVE;
        emit BridgeStartedByVolume(keccak256(abi.encodePacked(now)));
    }

    function _pausedByBridgeVolumeForAddress(address sender) internal {
        emit HostAccountPausedMessage(keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay())), msg.sender, now);
        pauseAccountByVolume[sender] = true;
    }

    function _resumedByBridgeVolumeForAddress(address sender) internal {
        pauseAccountByVolume[sender] = false;
        emit HostAccountResumedMessage(keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay())), msg.sender, now);
    }

    function _setPausedStatusForGuestAddress(bytes32 sender) internal {
       emit GuestAccountPausedMessage(keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay())), sender, now);
    }

    function _setResumedStatusForGuestAddress(bytes32 sender) internal
    {
       emit GuestAccountResumedMessage(keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay())), sender, now);
    }

    /* Bridge Status Function */
    function _startBridge() internal 
    {
        bridgeStatus = BridgeStatus.ACTIVE;
        emit BridgeStarted();
    }

    function _resumeBridge() internal
    {
        bridgeStatus = BridgeStatus.ACTIVE;
        emit BridgeResumed();
    }

    function _stopBridge() internal {
        bridgeStatus = BridgeStatus.STOPPED;
        emit BridgeStopped();
    }

    function _pauseBridge() internal {
        bridgeStatus = BridgeStatus.PAUSED;
        emit BridgePaused();
    }


}