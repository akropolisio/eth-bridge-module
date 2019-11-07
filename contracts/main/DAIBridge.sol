pragma solidity ^0.5.12;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";

//Beneficieries (validators) template
import "../helpers/ValidatorsOperations.sol";
import "../third-party/BokkyPooBahsDateTimeLibrary.sol";

contract DAIBridge is ValidatorsOperations {

    using BokkyPooBahsDateTimeLibrary for uint;

    IERC20 private token;

    enum TransferStatus {PENDING, WITHDRAW, APPROVED, CANCELED, CONFIRMED, CONFIRMED_WITHDRAW, CANCELED_CONFIRMATION}

    enum BridgeStatus {ACTIVE, PAUSED, STOPPED}

    enum ProposalStatus {PENDING, APPROVED, DECLINED}

    struct Message {
        bytes32 messageID;
        address spender;
        bytes32 substrateAddress;
        uint availableAmount;
        bool isExists; //check message is exists
        TransferStatus status;
    }

    struct Limits {
        uint minTransactionValue;
        uint maxTransactionValue;
        uint dayMaxLimit;
        uint dayMaxLimitForOneAddress;
        uint maxPendingTransactionLimit;
    }

    struct Proposal {
        bytes32 proposalID;
        uint value;
        uint timestamp;

    }

    event RelayMessage(bytes32 messageID, address sender, bytes32 recipient, uint amount);
    event ConfirmMessage(bytes32 messageID, address sender, bytes32 recipient, uint amount);
    event RevertMessage(bytes32 messageID, address sender, uint amount);
    event WithdrawMessage(bytes32 MessageID, address recepient, bytes32 sender, uint amount);
    event ApprovedRelayMessage(bytes32 messageID, address  sender, bytes32 recipient, uint amount);
    event ConfirmWithdrawMessage(bytes32 messageID, address sender, bytes32 recipient, uint amount);
    event ConfirmCancelMessage(bytes32 messageID, address sender, bytes32 recipient, uint amount);


    event BridgeStarted();
    event BridgeStopped();
    event BridgePaused();


    event BridgePausedByVolume();
    event BridgeStartedByVolume();

    mapping(bytes32 => Message) messages;
    mapping(address => Message) messagesBySender;

    BridgeStatus bridgeStatus;
    Limits private limits;
  
    /** Proposals **/
    mapping(bytes32 => Proposal) minTransactionValueProposals;
    mapping(bytes32 => Proposal) maxTransactionValueProposals;
    mapping(bytes32 => Proposal) dayMaxLimitProposals;
    mapping(bytes32 => Proposal) dayMaxLimitForOneAddressProposals;
    mapping(bytes32 => Proposal) maxPendingTransactionLimitProposals;

    /* volume transactions */

    mapping(bytes32 => uint) currentVolumeByDate;
    mapping(bytes32 => mapping (address => uint)) currentDayVolumeForAddress;

    bool pauseBridgeByVolume;

    /**
    * @notice Constructor.
    * @param _token  Address of DAI token
    */
    constructor (IERC20 _token, uint _minTransactionValue, uint _maxTransactionValue, uint _dayMaxLimit, uint _dayMaxLimitForOneAddress, uint _maxPendingTransactionLimit) public
        ValidatorsOperations() {
        token = _token;
        limits.minTransactionValue = _minTransactionValue;
        limits.maxTransactionValue = _maxTransactionValue;
        limits.dayMaxLimit = _dayMaxLimit;
        limits.dayMaxLimitForOneAddress = _dayMaxLimitForOneAddress;
        limits.maxTransactionValue = _maxPendingTransactionLimit;
    }  

    // MODIFIERS
    /**
     * @dev Allows to perform method by existing Validator
    */
    modifier onlyExistingValidator(address _Validator) {
        require(isExistValidator(_Validator), "address is not in Validator array");
         _;
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
    modifier validMessage(bytes32 messageID, address spender, bytes32 substrateAddress, uint availableAmount) {
         require((messages[messageID].isExists && messages[messageID].spender == spender)
                && (messages[messageID].substrateAddress == substrateAddress)
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

    modifier activeBridgeStatus() {
        require(bridgeStatus == BridgeStatus.ACTIVE, "Bridge is stopped or paused");
        _;
    }

    modifier stoppedOrPausedBridgeStatus() {
        require((bridgeStatus == BridgeStatus.PAUSED || bridgeStatus == BridgeStatus.STOPPED), "Bridge is actived");
        _;
    }

    modifier checkMinMaxTransactionValue(uint value) {
        require(value < limits.maxTransactionValue && value < limits.minTransactionValue, "Transaction value is too  small or large");
        _;
    }

    modifier checkDayVolumeTransaction(uint value) {
        if (currentVolumeByDate[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))] > limits.dayMaxLimit) {
            _pauseBridge();
            pauseBridgeByVolume = true;
        } else {
            if (pauseBridgeByVolume) {
                pauseBridgeByVolume = false;
                _resumeBridge();
            }
            _;
        }
    }

    modifier checkDayVolumeTransactionForAddress(uint value) {
        require(currentDayVolumeForAddress[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))][msg.sender] > limits.dayMaxLimitForOneAddress, "Token transfer for address limit exceeded");
        _;
    }

    /**  
      Refactor this code 
    **/
    function setTransfer(uint amount, bytes32 substrateAddress) public 
    activeBridgeStatus
    checkMinMaxTransactionValue(amount)
    checkDayVolumeTransaction(amount)
    checkDayVolumeTransactionForAddress(amount) {
        require(token.allowance(msg.sender, address(this)) >= amount, "contract is not allowed to this amount");
        token.transferFrom(msg.sender, address(this), amount);
        Message  memory message = Message(keccak256(abi.encodePacked(now)), msg.sender, substrateAddress, amount, true, TransferStatus.PENDING);
        messages[keccak256(abi.encodePacked(now))] = message;
        currentVolumeByDate[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))] = currentVolumeByDate[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))].add(amount);
        currentDayVolumeForAddress[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))][msg.sender] = currentDayVolumeForAddress[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))][msg.sender].add(amount);
        emit RelayMessage(keccak256(abi.encodePacked(now)), msg.sender, substrateAddress, amount);
    }

    function revertTransfer(bytes32 messageID) public 
    activeBridgeStatus
    pendingMessage(messageID)  
    onlyManyValidators {
        Message storage message = messages[messageID];

        message.status = TransferStatus.CANCELED;

        token.transfer(msg.sender, message.availableAmount);

            emit RevertMessage(messageID, msg.sender, message.availableAmount);
    }

    /*
    * Approve finance by message ID when transfer pending
    */
    function approveTransfer(bytes32 messageID, address spender, bytes32 substrateAddress, uint availableAmount) public 
    activeBridgeStatus 
    validMessage(messageID, spender, substrateAddress, availableAmount) 
    pendingMessage(messageID) 
    onlyManyValidators {
        Message storage message = messages[messageID];
        message.status = TransferStatus.APPROVED;

        emit ApprovedRelayMessage(messageID, spender, substrateAddress, availableAmount);
    }

    /*
    * Confirm tranfer by message ID when transfer pending
    */
    function confirmTransfer(bytes32 messageID) public 
    activeBridgeStatus
    approvedMessage(messageID)  
    onlyManyValidators {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CONFIRMED;
        emit ConfirmMessage(messageID, message.spender, message.substrateAddress, message.availableAmount);
    }

    /*
    * Withdraw tranfer by message ID after approve from Substrate
    */
    function withdrawTransfer(bytes32 messageID, bytes32  sender, address recipient, uint availableAmount)  public 
    activeBridgeStatus 
    onlyManyValidators {
        require(token.balanceOf(address(this)) >= availableAmount, "Balance is not enough");
        token.transfer(recipient, availableAmount);
        Message  memory message = Message(messageID, msg.sender, sender, availableAmount, true, TransferStatus.WITHDRAW);
        messages[messageID] = message;
        emit WithdrawMessage(messageID, recipient, sender, availableAmount);
    }

    /*
    * Confirm Withdraw tranfer by message ID after approve from Substrate
    */
    function confirmWithdrawTransfer(bytes32 messageID)  public withdrawMessage(messageID) 
    activeBridgeStatus 
    onlyManyValidators {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CONFIRMED_WITHDRAW;
        emit ConfirmWithdrawMessage(messageID, message.spender, message.substrateAddress, message.availableAmount);
    }

    /*
    * Confirm Withdraw cancel by message ID after approve from Substrate
    */
    function confirmCancelTransfer(bytes32 messageID)  public 
    activeBridgeStatus 
    cancelMessage(messageID)  
    onlyManyValidators {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CONFIRMED_WITHDRAW;
        emit ConfirmCancelMessage(messageID, message.spender, message.substrateAddress, message.availableAmount);
    }

    /* Bridge Status Function */
    function resumeBridge() public 
    stoppedOrPausedBridgeStatus 
    onlyManyValidators {
        bridgeStatus = BridgeStatus.ACTIVE;
        emit BridgeStarted();
    }

    function stopBridge() public 
    onlyManyValidators {
        bridgeStatus = BridgeStatus.STOPPED;
        emit BridgeStopped();
    }

    function pauseBridge() public 
    onlyManyValidators {
        bridgeStatus = BridgeStatus.PAUSED;
        emit BridgePaused();
    }

    /* limits getters*/
    function getMinTransactionValue() public view returns (uint256) {
        return limits.minTransactionValue;
    }

    function getMaxTransactionValue() public view returns (uint256) {
        return limits.maxTransactionValue;
    }

    function getDayMaxLimit() public view returns (uint256) {
        return limits.dayMaxLimit;
    }

    function getDayMaxLimitForOneAddress() public view returns(uint256) {
        return limits.dayMaxLimitForOneAddress;
    }

    function getMaxPendingTransactionLimit() public view returns(uint256) {
        return limits.maxPendingTransactionLimit;
    }

    function _pauseBridge() internal {
        bridgeStatus = BridgeStatus.PAUSED;
        emit BridgePausedByVolume();
    }

    function _resumeBridge() internal {
        bridgeStatus = BridgeStatus.ACTIVE;
        emit BridgeStartedByVolume();
    }
}