pragma solidity ^0.5.12;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "../third-party/BokkyPooBahsDateTimeLibrary.sol";
import "../interfaces/ITransfers.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "../interfaces/IStatus.sol";
import "../interfaces/ILimits.sol";


contract Transfers is ITransfers, Ownable {

    enum TransferStatus {PENDING, WITHDRAW, APPROVED, CANCELED, CONFIRMED, CONFIRMED_WITHDRAW, CANCELED_CONFIRMED}
    
    IERC20 token;

    using BokkyPooBahsDateTimeLibrary for uint;
    using SafeMath for uint;

    ILimits limitsContract;
    IStatus statusContract;

    /*
        Struct
    */
    struct Message {
        bytes32 messageID;
        address spender;
        bytes32 guestAddress;
        uint availableAmount;
        bool isExists; //check message is exists
        TransferStatus status;
    }

    mapping(bytes32 => uint) currentVolumeByDate;

    /* pending volume */
    mapping(bytes32 => uint) currentVPendingVolumeByDate;

    mapping(bytes32 => mapping (address => uint)) currentDayVolumeForAddress;

    /*
    *    Events
    */
    event RelayMessage(bytes32 messageID, address sender, bytes32 recipient, uint amount, address token);
    event ConfirmMessage(bytes32 messageID, address sender, bytes32 recipient, uint amount, address token);
    event RevertMessage(bytes32 messageID, address sender, uint amount, address token);
    event WithdrawMessage(bytes32 messageID, address recepient, bytes32 sender, uint amount, address token);
    event ApprovedRelayMessage(bytes32 messageID, address  sender, bytes32 recipient, uint amount, address token);
    event ConfirmWithdrawMessage(bytes32 messageID, address sender, bytes32 recipient, uint amount, address token);
    event ConfirmCancelMessage(bytes32 messageID, address sender, bytes32 recipient, uint amount, address token);

    /*
       * Messages
    */
    mapping(bytes32 => Message) messages;
    mapping(address => bytes32[]) messagesBySender;

    modifier checkMinMaxTransactionValue(uint value) {
        uint[10] memory limits = limitsContract.getLimits();

        require(value < limits[0] && value < limits[1], "Transaction value is too  small or large");
        _;
    }

    modifier checkDayVolumeTransaction() {
        uint[10] memory limits = limitsContract.getLimits();

        if (currentVolumeByDate[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))] > limits[2]) {
            _;
            statusContract.pauseBridgeByVolume();
        } else {
            if (statusContract.isPausedByBridgVolume()) {
                statusContract.resumeBridgeByVolume();
            }
            _;
        }
    }

    modifier checkPendingDayVolumeTransaction() {
        uint[10] memory limits = limitsContract.getLimits();

        if (currentVPendingVolumeByDate[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))] > limits[4]) {
            _;
            statusContract.pauseBridgeByVolume();
        } else {
            if (statusContract.isPausedByBridgVolume()) {
                statusContract.resumeBridgeByVolume();
            }
            _;
        }
    }

    modifier checkDayVolumeTransactionForAddress() {

        uint[10] memory limits = limitsContract.getLimits();

        if (currentDayVolumeForAddress[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))][msg.sender] > limits[3]) {
             _;
             statusContract.pausedByBridgeVolumeForAddress(msg.sender);
        } else {
            if (statusContract.getStatusForAccount(msg.sender)) {
                statusContract.resumedByBridgeVolumeForAddress(msg.sender);
            }
            _;
        }
    }


    /*
        check available amount
    */
    modifier messageHasAmount(bytes32 messageID) {
         require((messages[messageID].isExists && messages[messageID].availableAmount > 0), "Amount withdraw");
        _;
    }

    /*
        check that message is valid
    */
    modifier validMessage(bytes32 messageID, address spender, bytes32 guestAddress, uint availableAmount) {
         require((messages[messageID].isExists && messages[messageID].spender == spender)
                && (messages[messageID].guestAddress == guestAddress)
                && (messages[messageID].availableAmount == availableAmount), "Data is not valid");
         _;
    }

    modifier pendingMessage(bytes32 messageID) {
        require(messages[messageID].isExists && messages[messageID].status == TransferStatus.PENDING, "Message is not pending");
        _;
    }

    modifier approvedMessage(bytes32 messageID) {
        require(messages[messageID].isExists && messages[messageID].status == TransferStatus.APPROVED, "Message is not approved");
         _;
    }

    modifier withdrawMessage(bytes32 messageID) {
        require(messages[messageID].isExists && messages[messageID].status == TransferStatus.WITHDRAW, "Message is not approved");
         _;
    }

    modifier cancelMessage(bytes32 messageID) {
         require(messages[messageID].isExists && messages[messageID].status == TransferStatus.CANCELED, "Message is not canceled");
        _;
    }

    modifier allowTransfer(address owner, uint256 amount) {
        require(token.allowance(owner, address(this)) >= amount, "contract is not allowed to this amount");
        _;
    }

    modifier checkBalance(uint256 availableAmount) {
        require(token.balanceOf(address(this)) >= availableAmount, "Balance is not enough");
        _;
    }

    function setTransfer(uint amount, address owner, bytes32 guestAddress) external 
    onlyOwner
    checkMinMaxTransactionValue(amount)
    checkPendingDayVolumeTransaction()
    checkDayVolumeTransaction()
    checkDayVolumeTransactionForAddress()
    allowTransfer(owner, amount) {
         /** to modifier **/
        
        token.transferFrom(owner, address(this), amount);
        bytes32 messageID = keccak256(abi.encodePacked(now));
        Message  memory message = Message(messageID, owner, guestAddress, amount, true, TransferStatus.PENDING);
        messages[keccak256(abi.encodePacked(now))] = message;

        messagesBySender[owner].push(messageID);
        
        _addPendingVolumeByDate(amount);
        emit RelayMessage(keccak256(abi.encodePacked(now)), owner, guestAddress, amount, address(token));
    }

    function revertTransfer(bytes32 messageID) external 
    onlyOwner
    pendingMessage(messageID) {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CANCELED;
        token.transfer(msg.sender, message.availableAmount);
        emit RevertMessage(messageID, msg.sender, message.availableAmount, address(token));
    }

    function approveTransfer(bytes32 messageID, address spender, bytes32 guestAddress, uint availableAmount) 
    onlyOwner
    validMessage(messageID, spender, guestAddress, availableAmount) 
    pendingMessage(messageID)external {
        Message storage message = messages[messageID];
        message.status = TransferStatus.APPROVED;

        emit ApprovedRelayMessage(messageID, spender, guestAddress, availableAmount, address(token));
    }

    function confirmTransfer(bytes32 messageID) external
    onlyOwner
    approvedMessage(messageID)
    checkDayVolumeTransaction()
    checkDayVolumeTransactionForAddress()  {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CONFIRMED;
        bytes32 dateID = keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()));
        currentVolumeByDate[dateID] = currentVolumeByDate[dateID].add(message.availableAmount);
        currentDayVolumeForAddress[dateID][getHost(messageID)] = currentDayVolumeForAddress[dateID][message.spender].add(message.availableAmount);
        emit ConfirmMessage(messageID, message.spender, message.guestAddress, message.availableAmount, address(token));
    }

    function withdrawTransfer(bytes32 messageID, bytes32  sender, address recipient, uint availableAmount) 
    onlyOwner
    checkBalance(availableAmount)
    external {
        token.transfer(recipient, availableAmount);
        Message  memory message = Message(messageID, msg.sender, sender, availableAmount, true, TransferStatus.WITHDRAW);
        messages[messageID] = message;
        emit WithdrawMessage(messageID, recipient, sender, availableAmount, address(token));
    }

    function confirmWithdrawTransfer(bytes32 messageID) external 
    onlyOwner
    checkDayVolumeTransaction()
    checkDayVolumeTransactionForAddress()
    withdrawMessage(messageID)  {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CONFIRMED_WITHDRAW;
        emit ConfirmWithdrawMessage(messageID, message.spender, message.guestAddress, message.availableAmount, address(token));
    }

    function  confirmCancelTransfer(bytes32 messageID) external 
    onlyOwner
    cancelMessage(messageID) {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CANCELED_CONFIRMED;

        emit ConfirmCancelMessage(messageID, message.spender, message.guestAddress, message.availableAmount, address(token));
    }

    function init(IERC20 _token, IStatus _status, ILimits _limits) initializer public {
        Ownable.initialize(msg.sender);
        token = _token;
        statusContract = _status;
        limitsContract = _limits;
    }

    function getMessageStatus(bytes32 messageID) public view returns (uint) {
        return uint(messages[messageID].status);
    }
    
    function isExistsMessage(bytes32 messageID) public view returns (bool) {
        return messages[messageID].isExists;
    }

    function getHost(bytes32 messageID) public view returns (address) {
        return messages[messageID].spender;
    }

     function getGuest(bytes32 messageID) public view returns (bytes32) {
        return messages[messageID].guestAddress;
    }

    function getAvailableAmount(bytes32 messageID) public view returns (uint) {
        return messages[messageID].availableAmount;
    }

    function _getFirstMessageIDByAddress(address sender) public view returns (bytes32) {
        return messagesBySender[sender][0];
    }

    function _addVolumeByMessageID(bytes32 messageID) private {
        
    }  

    function _addPendingVolumeByDate(uint256 availableAmount) private {
        bytes32 dateID = keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()));
        currentVolumeByDate[dateID] = currentVolumeByDate[dateID].add(availableAmount);
    }

}
