pragma solidity ^0.5.12;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";

//Beneficieries (validators) template
import "../helpers/ValidatorsOperations.sol";
import "../third-party/BokkyPooBahsDateTimeLibrary.sol";

contract DAIBridge is Initializable, ValidatorsOperations {

    using BokkyPooBahsDateTimeLibrary for uint;

    IERC20 private token;

    enum TransferStatus {PENDING, WITHDRAW, APPROVED, CANCELED, CONFIRMED, CONFIRMED_WITHDRAW, CANCELED_CONFIRMED}

    enum BridgeStatus {ACTIVE, PAUSED, STOPPED}

    enum ProposalStatus {PENDING, APPROVED, DECLINED}

    struct Message {
        bytes32 messageID;
        address spender;
        bytes32 guestAddress;
        uint availableAmount;
        bool isExists; //check message is exists
        TransferStatus status;
    }

    struct Limits {
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
    
    //ETH Account
    event HostAccountPausedMessage(bytes32 messageID, address sender, uint timestamp);
    event HostAccountResumedMessage(bytes32 messageID, address sender, uint timestamp);

    //guest
    event GuestAccountPausedMessage(bytes32 messageID, bytes32 recipient, uint timestamp);
    event GuestAccountResumedMessage(bytes32 messageID, bytes32 recipient, uint timestamp);

    event BridgeStarted();
    event BridgeStopped();
    event BridgeResumed();
    event BridgePaused();


    event BridgePausedByVolume(bytes32 messageID);
    event BridgeStartedByVolume(bytes32 messageID);

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

    /* pending volume */
    mapping(bytes32 => uint) currentVPendingVolume;
    
    mapping(bytes32 => mapping (address => uint)) currentDayVolumeForAddress;
    bool pauseBridgeByVolume;
   
    mapping(address => bool) pauseAccountByVolume;

    /**
    * @notice Constructor.
    * @param _token  Address of DAI token
    */
    function initialize(IERC20 _token) public 
    initializer {
        ValidatorsOperations.initialize();
        token = _token;
        limits.minHostTransactionValue = 10*10**18;
        limits.maxHostTransactionValue = 100*10**18;
        limits.dayHostMaxLimit = 200*10**18;
        limits.dayHostMaxLimitForOneAddress = 50*10**18;
        limits.maxHostPendingTransactionLimit = 400*10**18;

        limits.minGuestTransactionValue = 10*10**18;
        limits.maxGuestTransactionValue = 100*10**18;
        limits.dayGuestMaxLimit = 200*10**18;
        limits.dayGuestMaxLimitForOneAddress = 50*10**18;
        limits.maxGuestPendingTransactionLimit = 400*10**18;
       
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

    modifier activeBridgeStatus() {
        require(bridgeStatus == BridgeStatus.ACTIVE, "Bridge is stopped or paused");
        _;
    }

    modifier stoppedOrPausedBridgeStatus() {
        require((bridgeStatus == BridgeStatus.PAUSED || bridgeStatus == BridgeStatus.STOPPED), "Bridge is actived");
        _;
    }

    modifier checkMinMaxTransactionValue(uint value) {
        require(value < limits.maxHostTransactionValue && value < limits.minHostTransactionValue, "Transaction value is too  small or large");
        _;
    }

   /*
    сделать закрываюшую объем транзакцию и fail в случае превышения объема
   */
    modifier checkDayVolumeTransaction() {
        if (currentVolumeByDate[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))] > limits.dayHostMaxLimit) {
            _;
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

    modifier checkDayVolumeTransactionForAddress() {
        if (currentDayVolumeForAddress[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))][msg.sender] > limits.dayHostMaxLimitForOneAddress) {
             _;
            emit HostAccountPausedMessage(keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay())), msg.sender, now);
            pauseAccountByVolume[msg.sender] = true;
        } else {
            if (pauseAccountByVolume[msg.sender]) {
                pauseAccountByVolume[msg.sender] = false;
                emit HostAccountResumedMessage(keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay())), msg.sender, now);
            }
            _;
        }
    }

    /**  
      Refactor this code 
    **/
    function setTransfer(uint amount, bytes32 guestAddress) public 
    activeBridgeStatus
    checkMinMaxTransactionValue(amount)
    checkDayVolumeTransaction()
    checkDayVolumeTransactionForAddress() {
        require(token.allowance(msg.sender, address(this)) >= amount, "contract is not allowed to this amount");
        token.transferFrom(msg.sender, address(this), amount);
        Message  memory message = Message(keccak256(abi.encodePacked(now)), msg.sender, guestAddress, amount, true, TransferStatus.PENDING);
        messages[keccak256(abi.encodePacked(now))] = message;

        emit RelayMessage(keccak256(abi.encodePacked(now)), msg.sender, guestAddress, amount);
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
    function approveTransfer(bytes32 messageID, address spender, bytes32 guestAddress, uint availableAmount) public 
    activeBridgeStatus 
    validMessage(messageID, spender, guestAddress, availableAmount) 
    pendingMessage(messageID) 
    onlyManyValidators {
        Message storage message = messages[messageID];
        message.status = TransferStatus.APPROVED;

        emit ApprovedRelayMessage(messageID, spender, guestAddress, availableAmount);
    }

    /*
    * Confirm tranfer by message ID when transfer pending
    */
    function confirmTransfer(bytes32 messageID) public 
    activeBridgeStatus
    approvedMessage(messageID)  
    checkDayVolumeTransaction()
    checkDayVolumeTransactionForAddress()
    onlyManyValidators {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CONFIRMED;
        emit ConfirmMessage(messageID, message.spender, message.guestAddress, message.availableAmount);
    }

    /*
    * Withdraw tranfer by message ID after approve from guest
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
    * Confirm Withdraw tranfer by message ID after approve from guest
    */
    function confirmWithdrawTransfer(bytes32 messageID)  public withdrawMessage(messageID) 
    activeBridgeStatus 
    checkDayVolumeTransaction()
    checkDayVolumeTransactionForAddress()
    onlyManyValidators {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CONFIRMED_WITHDRAW;
        emit ConfirmWithdrawMessage(messageID, message.spender, message.guestAddress, message.availableAmount);
    }

    /*
    * Confirm Withdraw cancel by message ID after approve from guest
    */
    function confirmCancelTransfer(bytes32 messageID)  public 
    activeBridgeStatus 
    cancelMessage(messageID)  
    onlyManyValidators {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CANCELED_CONFIRMED;

        emit ConfirmCancelMessage(messageID, message.spender, message.guestAddress, message.availableAmount);
    }

    /* Bridge Status Function */
    function startBridge() public 
    stoppedOrPausedBridgeStatus 
    onlyManyValidators {
        bridgeStatus = BridgeStatus.ACTIVE;
        emit BridgeStarted();
    }

    function resumeBridge() public 
    stoppedOrPausedBridgeStatus 
    onlyManyValidators {
        bridgeStatus = BridgeStatus.ACTIVE;
        emit BridgeResumed();
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

    function setPausedStatusForGuestAddress(bytes32 sender) 
    onlyManyValidators
    public {
       emit GuestAccountPausedMessage(keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay())), sender, now);
    }

    function setResumedStatusForGuestAddress(bytes32 sender) 
    onlyManyValidators
    public {
       emit GuestAccountResumedMessage(keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay())), sender, now);
    }

    /*limit getter */
    function getLimits() public view returns 
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

    function _pauseBridge() internal {
        bridgeStatus = BridgeStatus.PAUSED;
        emit BridgePausedByVolume(keccak256(abi.encodePacked(now)));
    }

    function _resumeBridge() internal {
        bridgeStatus = BridgeStatus.ACTIVE;
        emit BridgeStartedByVolume(keccak256(abi.encodePacked(now)));
    }

    function _addVolumeByMessageID(bytes32 messageID) internal {
        Message storage message = messages[messageID];
        message.status = TransferStatus.CONFIRMED;
        bytes32 dateID = keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()));
        currentVolumeByDate[dateID] = currentVolumeByDate[dateID].add(message.availableAmount);
        currentDayVolumeForAddress[dateID][message.spender] = currentDayVolumeForAddress[dateID][message.spender].add(message.availableAmount);
    }

   
}