pragma solidity ^0.5.12;

import "../third-party/BokkyPooBahsDateTimeLibrary.sol";
import "../bridge/Limits.sol";

import "../interfaces/ILimits.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "../interfaces/IDao.sol";

contract Dao is IDao, Ownable {

    using BokkyPooBahsDateTimeLibrary for uint;
    /*
    * Statuses
    */
    enum ProposalStatus {PENDING, APPROVED, DECLINED}

    event ProposalCreated(bytes32 proposalID, address sender, uint minHostTransactionValue, 
    uint maxHostTransactionValue,
    uint dayHostMaxLimit,
    uint dayHostMaxLimitForOneAddress,
    uint maxHostPendingTransactionLimit,
    uint minGuestTransactionValue,
    uint maxGuestTransactionValue,
    uint dayGuestMaxLimit,
    uint dayGuestMaxLimitForOneAddress,
    uint maxGuestPendingTransactionLimit);

    event ProposalApproved(bytes32 proposalID);

    struct Proposal {
        bytes32 proposalID;
        ProposalStatus status;
        address sender;
        uint timestamp;
        uint[10] limits;
        bool isExists;
    }

    ILimits limits;

    /** Proposals **/
    mapping(bytes32 => Proposal) internal proposals;
    bytes32[] proposalsArray;

    mapping(bytes32 => uint) internal proposalsCountByDate;

    modifier checkProposalByDate() {
        require(proposalsCountByDate[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))] <= 3, "proposal limit exceeded");
        _;
    }

    function createProposal(uint[10] calldata parameters) checkProposalByDate external onlyOwner {   
        bytes32 proposalID = keccak256(abi.encodePacked(now));
        Proposal memory proposal = Proposal(proposalID, ProposalStatus.PENDING, msg.sender, now, parameters, true); 
        proposals[proposalID] = proposal;
        proposalsArray.push(proposalID);

        proposalsCountByDate[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))] = proposalsCountByDate[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))]+1;

        emit ProposalCreated(proposalID, msg.sender, parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5], parameters[6], parameters[7], parameters[8], parameters[9]);
    }

    function approvedNewProposal(bytes32 proposalID) external onlyOwner {
        Proposal memory proposal = proposals[proposalID];

        proposal.status = ProposalStatus.APPROVED;

        limits.setLimits(
            proposal.limits[0],
            proposal.limits[1],
            proposal.limits[2],
            proposal.limits[3],
            proposal.limits[4],
            proposal.limits[5],
            proposal.limits[6],
            proposal.limits[7],
            proposal.limits[8],
            proposal.limits[9]
        );
        
        emit ProposalApproved(proposalID);
    }

    function init(ILimits _limits) initializer public {
        Ownable.initialize(msg.sender);
        limits = _limits;
    }

    function _getFirstMessageIDByAddress() public view returns (bytes32) {
        return proposalsArray[0];
    }
}