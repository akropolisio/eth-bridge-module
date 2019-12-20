pragma solidity ^0.5.12;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "../third-party/BokkyPooBahsDateTimeLibrary.sol";
import "../interfaces/ITransfers.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

contract Transfers is ITransfers, Ownable {

    enum TransferStatus {PENDING, WITHDRAW, APPROVED, CANCELED, CONFIRMED, CONFIRMED_WITHDRAW, CANCELED_CONFIRMED}
    
    IERC20 token;

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

    /*
    *    Events
    */
    event RelayMessage(bytes32 messageID, address sender, bytes32 recipient, uint amount);
    event ConfirmMessage(bytes32 messageID, address sender, bytes32 recipient, uint amount);
    event RevertMessage(bytes32 messageID, address sender, uint amount);
    event WithdrawMessage(bytes32 messageID, address recepient, bytes32 sender, uint amount);
    event ApprovedRelayMessage(bytes32 messageID, address  sender, bytes32 recipient, uint amount);
    event ConfirmWithdrawMessage(bytes32 messageID, address sender, bytes32 recipient, uint amount);
    event ConfirmCancelMessage(bytes32 messageID, address sender, bytes32 recipient, uint amount);

    /*
       * Messages
    */
    mapping(bytes32 => Message) messages;
    mapping(address => bytes32[]) messagesBySender;

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
    allowTransfer(owner, amount) {
         /** to modifier **/
        
        token.transferFrom(owner, address(this), amount);

        bytes32 messageID = keccak256(abi.encodePacked(now));
        Message  memory message = Message(messageID, owner, guestAddress, amount, true, TransferStatus.PENDING);
        messages[keccak256(abi.encodePacked(now))] = message;

        messagesBySender[owner].push(messageID);

        emit RelayMessage(keccak256(abi.encodePacked(now)), owner, guestAddress, amount);
    }

    function revertTransfer(bytes32 messageID) external 
    onlyOwner
    pendingMessage(messageID) {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CANCELED;
        token.transfer(msg.sender, message.availableAmount);
        emit RevertMessage(messageID, msg.sender, message.availableAmount);
    }

    function approveTransfer(bytes32 messageID, address spender, bytes32 guestAddress, uint availableAmount) 
    onlyOwner
    validMessage(messageID, spender, guestAddress, availableAmount) 
    pendingMessage(messageID)external {
        Message storage message = messages[messageID];
        message.status = TransferStatus.APPROVED;

        emit ApprovedRelayMessage(messageID, spender, guestAddress, availableAmount);
    }

    function confirmTransfer(bytes32 messageID) external
    onlyOwner
    approvedMessage(messageID)  {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CONFIRMED;
        emit ConfirmMessage(messageID, message.spender, message.guestAddress, message.availableAmount);
    }

    function withdrawTransfer(bytes32 messageID, bytes32  sender, address recipient, uint availableAmount) 
    onlyOwner
    checkBalance(availableAmount)
    external {
        token.transfer(recipient, availableAmount);
        Message  memory message = Message(messageID, msg.sender, sender, availableAmount, true, TransferStatus.WITHDRAW);
        messages[messageID] = message;
        emit WithdrawMessage(messageID, recipient, sender, availableAmount);
    }

    function confirmWithdrawTransfer(bytes32 messageID) external 
    onlyOwner
    withdrawMessage(messageID)  {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CONFIRMED_WITHDRAW;
        emit ConfirmWithdrawMessage(messageID, message.spender, message.guestAddress, message.availableAmount);
    }

    function  confirmCancelTransfer(bytes32 messageID) external 
    onlyOwner
    cancelMessage(messageID) {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CANCELED_CONFIRMED;

        emit ConfirmCancelMessage(messageID, message.spender, message.guestAddress, message.availableAmount);
    }

    function init(IERC20 _token) initializer public {
        Ownable.initialize(msg.sender);
        token = _token;
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

}
