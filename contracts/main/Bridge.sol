pragma solidity ^0.5.12;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "../helpers/ValidatorsOperations.sol";

//Beneficieries (validators) template
import "../interfaces/IStatus.sol";
import "../interfaces/ITransfers.sol";
import "../interfaces/IDao.sol";
import "../interfaces/ICandidate.sol";
import "../interfaces/ILimits.sol";


contract Bridge is ValidatorsOperations  {

    /* volume transactions */
    ITransfers transferContract;
    IDao daoContract; 
    ICandidate candidateContract;
    IStatus statusContract;
    
    /**
    * @notice Constructor
    */
    function initialize(IStatus _status, ITransfers _transfer, IDao _dao, ICandidate _candidate) public initializer
    {
        ValidatorsOperations.init();
        statusContract = _status;
        daoContract = _dao;
        transferContract = _transfer;
        candidateContract = _candidate;
    } 

    // MODIFIERS
    /**
     * @dev Allows to perform method by existing Validator
    */
    modifier onlyExistingValidator(address _Validator) {
        require(isExistValidator(_Validator), "address is not in Validator array");
         _;
    }

    modifier activeBridgeStatus() {
        require(statusContract.getStatusBridge() == 0, "Bridge is stopped or paused");
        _;
    }

    function setTransfer(uint amount, bytes32 guestAddress) public 
    activeBridgeStatus
    {
       //_addPendingVolumeByDate(amount);
       transferContract.setTransfer(amount, msg.sender, guestAddress);
    }

    function revertTransfer(bytes32 messageID) public 
    activeBridgeStatus
    onlyManyValidators {
        transferContract.revertTransfer(messageID);
    }

    function approveTransfer(bytes32 messageID, address spender, bytes32 guestAddress, uint availableAmount) public 
    activeBridgeStatus 
    onlyManyValidators {
       transferContract.approveTransfer(messageID, spender, guestAddress, availableAmount);
    }
    
    function confirmTransfer(bytes32 messageID) public 
    activeBridgeStatus
    onlyManyValidators {
        transferContract.confirmTransfer(messageID);
    }
    
    function withdrawTransfer(bytes32 messageID, bytes32  sender, address recipient, uint availableAmount)  public 
    activeBridgeStatus
    onlyManyValidators {
        transferContract.withdrawTransfer(messageID, sender, recipient, availableAmount);
    }
    
    function confirmWithdrawTransfer(bytes32 messageID)  public
    activeBridgeStatus 
    onlyManyValidators {
        transferContract.confirmWithdrawTransfer(messageID);
    }

    function confirmCancelTransfer(bytes32 messageID)  public 
    activeBridgeStatus  
    onlyManyValidators {
       transferContract.confirmCancelTransfer(messageID);
    }

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
}
