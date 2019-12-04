pragma solidity ^0.5.12;

import "../third-party/BokkyPooBahsDateTimeLibrary.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "../interfaces/IStatus.sol";

contract Status {

    using BokkyPooBahsDateTimeLibrary for uint;

    /*
       Bridge pause/stop
    */
    event BridgeStarted(bytes32 messageID);
    event BridgeStopped(bytes32 messageID);
    event BridgeResumed(bytes32 messageID);
    event BridgePaused(bytes32 messageID);

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

    bool internal pauseBridgeByVolumeBool;

    mapping(address => bool) internal pauseAccountByVolume;

    modifier activeBridgeStatus() {
        require(bridgeStatus == BridgeStatus.ACTIVE, "Bridge is stopped or paused");
        _;
    }

    modifier stoppedOrPausedBridgeStatus() {
        require((bridgeStatus == BridgeStatus.PAUSED || bridgeStatus == BridgeStatus.STOPPED), "Bridge is actived");
        _;
    }

    function pauseBridgeByVolume() external {
        pauseBridgeByVolumeBool = true;
        bridgeStatus = BridgeStatus.PAUSED_BY_VOLUME;
        emit BridgePausedByVolume(keccak256(abi.encodePacked(now)));
    }

    function resumeBridgeByVolume() external {
        pauseBridgeByVolumeBool = false;
        bridgeStatus = BridgeStatus.ACTIVE;
        emit BridgeStartedByVolume(keccak256(abi.encodePacked(now)));
    }

    function pausedByBridgeVolumeForAddress(address sender) external {
        emit HostAccountPausedMessage(keccak256(abi.encodePacked(now)), msg.sender, now);
        pauseAccountByVolume[sender] = true;
    }

    function resumedByBridgeVolumeForAddress(address sender) external {
        pauseAccountByVolume[sender] = false;
        emit HostAccountResumedMessage(keccak256(abi.encodePacked(now)), msg.sender, now);
    }

    function setPausedStatusForGuestAddress(bytes32 sender) external {
       emit GuestAccountPausedMessage(keccak256(abi.encodePacked(now)), sender, now);
    }

    function setResumedStatusForGuestAddress(bytes32 sender) external
    {
       emit GuestAccountResumedMessage(keccak256(abi.encodePacked(now)), sender, now);
    }

    /* Bridge Status Function */
    function startBridge() external 
    {
        bridgeStatus = BridgeStatus.ACTIVE;
        emit BridgeStarted(keccak256(abi.encodePacked(now)));
    }

    function resumeBridge() external
    {
        bridgeStatus = BridgeStatus.ACTIVE;
        emit BridgeResumed(keccak256(abi.encodePacked(now)));
    }

    function stopBridge() external {
        bridgeStatus = BridgeStatus.STOPPED;
        emit BridgeStopped(keccak256(abi.encodePacked(now)));
    }

    function pauseBridge() external {
        bridgeStatus = BridgeStatus.PAUSED;
        emit BridgePaused(keccak256(abi.encodePacked(now)));
    }


}