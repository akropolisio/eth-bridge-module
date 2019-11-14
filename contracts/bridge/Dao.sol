pragma solidity ^0.5.12;

import "../third-party/BokkyPooBahsDateTimeLibrary.sol";
import "../bridge/Limits.sol";
import "../helpers/ValidatorsOperations.sol";
import "../third-party/BokkyPooBahsDateTimeLibrary.sol";

contract Dao is Limits {

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
        BridgeLimits limits;
        bool isExists;
    }

    /** Proposals **/
    mapping(bytes32 => Proposal) internal proposals;

    mapping(bytes32 => uint) internal proposalsCountByDate;

    modifier checkProposalByDate() {
        require(proposalsCountByDate[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))] <= 3, "proposal limit exceeded");
        _;
    }

    function _createProposal(uint[10] memory parameters) checkProposalByDate internal {

        BridgeLimits memory limits;
        limits.minHostTransactionValue = parameters[0];
        limits.maxHostTransactionValue = parameters[1];
        limits.dayHostMaxLimit = parameters[2];
        limits.dayHostMaxLimitForOneAddress = parameters[3];
        limits.maxHostPendingTransactionLimit = parameters[4];
        //ETH Limits
        limits.minGuestTransactionValue = parameters[5];
        limits.maxGuestTransactionValue = parameters[6];
        limits.dayGuestMaxLimit = parameters[7];
        limits.dayGuestMaxLimitForOneAddress = parameters[8];
        limits.maxGuestPendingTransactionLimit = parameters[9];

        bytes32 proposalID = keccak256(abi.encodePacked(now));
        Proposal memory proposal = Proposal(proposalID, ProposalStatus.PENDING, msg.sender, now, limits, true); 
        proposals[proposalID] = proposal;
        proposalsCountByDate[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))] = proposalsCountByDate[keccak256(abi.encodePacked(now.getYear(), now.getMonth(), now.getDay()))]+1;

        emit ProposalCreated(proposalID, msg.sender, parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5], parameters[6], parameters[7], parameters[8], parameters[9]);
    }

    function _approvedNewProposal(BridgeLimits storage limits, bytes32 proposalID) internal {
        Proposal memory proposal = proposals[proposalID];

        proposal.status = ProposalStatus.APPROVED;
        limits.minHostTransactionValue = proposal.limits.minHostTransactionValue;
        limits.maxHostTransactionValue = proposal.limits.maxHostTransactionValue;
        limits.dayHostMaxLimit = proposal.limits.dayHostMaxLimit;
        limits.dayHostMaxLimitForOneAddress = proposal.limits.dayHostMaxLimitForOneAddress;
        limits.maxHostPendingTransactionLimit = proposal.limits.maxHostPendingTransactionLimit;
        //ETH Limits
        limits.minGuestTransactionValue = proposal.limits.minGuestTransactionValue;
        limits.maxGuestTransactionValue = proposal.limits.maxGuestTransactionValue;
        limits.dayGuestMaxLimit = proposal.limits.dayGuestMaxLimit;
        limits.dayGuestMaxLimitForOneAddress = proposal.limits.dayGuestMaxLimitForOneAddress;
        limits.maxGuestPendingTransactionLimit = proposal.limits.maxGuestPendingTransactionLimit;

        emit ProposalApproved(proposalID);
        emit SetNewLimits(
          limits.minHostTransactionValue, 
          limits.maxHostTransactionValue, 
          limits.dayHostMaxLimit,
          limits.dayHostMaxLimitForOneAddress,
          limits.maxHostPendingTransactionLimit,
          limits.minGuestTransactionValue,
          limits.maxGuestTransactionValue,
          limits.dayGuestMaxLimit,
          limits.dayGuestMaxLimitForOneAddress,
          limits.maxGuestPendingTransactionLimit 
        );
    }
}