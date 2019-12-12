pragma solidity ^0.5.12;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "../helpers/ValidatorsOperations.sol";

//Beneficieries (validators) template
import "../third-party/BokkyPooBahsDateTimeLibrary.sol";
import "../interfaces/IStatus.sol";
import "../interfaces/ITransfers.sol";
import "../interfaces/IDao.sol";
import "../interfaces/ICandidate.sol";
import "../interfaces/ILimits.sol";


contract Bridge is Initializable, ValidatorsOperations {

    using BokkyPooBahsDateTimeLibrary for uint;


    /* volume transactions */

    mapping(bytes32 => uint) currentVolumeByDate;

    /* pending volume */
    mapping(bytes32 => uint) currentVPendingVolumeByDate;

    mapping(bytes32 => mapping (address => uint)) currentDayVolumeForAddress;

    IStatus statusContract;
    ITransfers transferContract;
    IDao daoContract; 
    ICandidate candidateContract;
    ILimits limitsContract;
    
    /**
    * @notice Constructor
    */
    function initialize(IStatus _status, ITransfers _transfer, IDao _dao, ICandidate _candidate, ILimits _limits) public 
    initializer {
        ValidatorsOperations.initialize();
        statusContract = _status;
        daoContract = _dao;
        transferContract = _transfer;
        candidateContract = _candidate;
        limitsContract = _limits;
    } 

    // MODIFIERS
    /**
     * @dev Allows to perform method by existing Validator
    */
    modifier onlyExistingValidator(address _Validator) {
        require(isExistValidator(_Validator), "address is not in Validator array");
         _;
    }

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
        check that message is valid
    */
    modifier validMessage(bytes32 messageID, address spender, bytes32 guestAddress, uint availableAmount) {
         require((transferContract.isExistsMessage(messageID) && transferContract.getHost(messageID) == spender)
                && (transferContract.getGuest(messageID) == guestAddress)
                && (transferContract.getAvailableAmount(messageID) == availableAmount), "Data is not valid");
         _;
    }

    modifier pendingMessage(bytes32 messageID) {
        require(transferContract.isExistsMessage(messageID) && transferContract.getMessageStatus(messageID) == 0, "Message is not pending");
        _;
    }

    modifier approvedMessage(bytes32 messageID) {
        require(transferContract.isExistsMessage(messageID) && transferContract.getMessageStatus(messageID) == 2, "Message is not approved");
         _;
    }

    modifier withdrawMessage(bytes32 messageID) {
        require(transferContract.isExistsMessage(messageID) && transferContract.getMessageStatus(messageID) == 1, "Message is not approved");
         _;
    }

    modifier cancelMessage(bytes32 messageID) {
         require(transferContract.isExistsMessage(messageID) && transferContract.getMessageStatus(messageID) == 3, "Message is not canceled");
        _;
    }

    modifier activeBridgeStatus() {
        require(statusContract.getStatusBridge() == 0, "Bridge is stopped or paused");
        _;
    }

    /*
        public functions
    */
    function setTransfer(uint amount, bytes32 guestAddress) public 
    activeBridgeStatus
    checkMinMaxTransactionValue(amount)
    checkPendingDayVolumeTransaction()
    checkDayVolumeTransaction()
    checkDayVolumeTransactionForAddress() {
       //_addPendingVolumeByDate(amount);
       transferContract.setTransfer(amount, guestAddress);
    }

    /*
        revert function
    */
    function revertTransfer(bytes32 messageID) public 
    activeBridgeStatus
    pendingMessage(messageID)  
    onlyManyValidators {
        transferContract.revertTransfer(messageID);
    }

    /*
    * Approve finance by message ID when transfer pending
    */
    function approveTransfer(bytes32 messageID, address spender, bytes32 guestAddress, uint availableAmount) public 
    activeBridgeStatus 
    validMessage(messageID, spender, guestAddress, availableAmount) 
    pendingMessage(messageID) 
    onlyManyValidators {
       transferContract.approveTransfer(messageID, spender, guestAddress, availableAmount);
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
        transferContract.confirmTransfer(messageID);
        //_addVolumeByMessageID(messageID);
    }
    
    /*
    * Withdraw tranfer by message ID after approve from guest
    */
    function withdrawTransfer(bytes32 messageID, bytes32  sender, address recipient, uint availableAmount)  public 
    activeBridgeStatus
    onlyManyValidators {
        transferContract.withdrawTransfer(messageID, sender, recipient, availableAmount);
    }
    
    /*
    * Confirm Withdraw tranfer by message ID after approve from guest
    */
    function confirmWithdrawTransfer(bytes32 messageID)  public withdrawMessage(messageID) 
    activeBridgeStatus 
    checkDayVolumeTransaction()
    checkDayVolumeTransactionForAddress()
    onlyManyValidators {
        transferContract.confirmWithdrawTransfer(messageID);
    }

    /*
    * Confirm Withdraw cancel by message ID after approve from guest
    */
    function confirmCancelTransfer(bytes32 messageID)  public 
    activeBridgeStatus 
    cancelMessage(messageID)  
    onlyManyValidators {
       transferContract.confirmCancelTransfer(messageID);
    }
    
    /* Bridge Status Function */
    function startBridge() public 
    onlyManyValidators {
        statusContract.startBridge();
    }
    
    function resumeBridge() public 
    onlyManyValidators {
        statusContract.resumeBridge();
    }
    
    function stopBridge() public 
    onlyManyValidators {
        statusContract.stopBridge();
    }
    
    function pauseBridge() public 
    onlyManyValidators {
        statusContract.pauseBridge();
    }

    function setPausedStatusForGuestAddress(bytes32 sender) 
    onlyManyValidators
    public {
       statusContract.setPausedStatusForGuestAddress(sender);
    }

    function setResumedStatusForGuestAddress(bytes32 sender) 
    onlyManyValidators
    public {
       statusContract.setResumedStatusForGuestAddress(sender);
    }

    /*
     DAO Parameters
    */
    function createProposal(uint[10] memory parameters) 
    onlyExistingValidator(msg.sender)
    public  {
        daoContract.createProposal(parameters);  
    }

    function approvedNewProposal(bytes32 proposalID)
    onlyManyValidators
    public
    {
        daoContract.approvedNewProposal(proposalID);
    }

    /*
        validatorsProposal
    */
    function createCandidatesValidatorsProposal(address[] memory hosts)
    onlyExistingValidator(msg.sender)
    public {
        candidateContract.createCandidatesValidatorsProposal(hosts);
    }

    function approveNewValidatorsList(bytes32 proposalID)
    onlyManyValidators
    public {
        address[] memory hosts = candidateContract.getValidatorsListByProposalID(proposalID);
        changeValidatorsWithHowMany(hosts, hosts.length*6/10);        
    }

    function addCandidate(address host, bytes32 guest) public  existValidator(msg.sender)
    {
        candidateContract.addCandidate(host, guest);
    }

    function removeCandidate(address host) public existValidator(msg.sender) {
        candidateContract.removeCandidate(host);
    }

    /*
     * Internal functions
    */
    function _addVolumeByMessageID(bytes32 messageID) internal {
        bytes32 dateID = keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()));
        currentVolumeByDate[dateID] = currentVolumeByDate[dateID].add(transferContract.getAvailableAmount(messageID));
        currentDayVolumeForAddress[dateID][transferContract.getHost(messageID)] = currentDayVolumeForAddress[dateID][transferContract.getHost(messageID)].add(transferContract.getAvailableAmount(messageID));
    }  

    function _addPendingVolumeByDate(uint256 availableAmount) internal {
        bytes32 dateID = keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()));
        currentVolumeByDate[dateID] = currentVolumeByDate[dateID].add(availableAmount);
    }
}
