pragma solidity ^0.5.12;

import "../interfaces/ICandidate.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


/*
 add contructor for initialize
*/

contract Candidate is ICandidate, Initializable {

    struct ValidatorsListProposal {
        bytes32 proposalID;
        address[] hosts;
        bool isExists;
    }

    struct CandidateValidator {
        address host;
        bytes32 guest;
        bool isExists;

    }

    mapping (address => CandidateValidator) candidates;
    mapping (bytes32 => bool) guestCandidates;
    mapping(bytes32 => ValidatorsListProposal) validatorsCandidatesPropoposals;

    event AddCandidateValidator(bytes32 messageID, address host, bytes32 guest);
    event RemoveCandidateValidator(bytes32 messageID, address host, bytes32 guest);
    event ProposalCandidatesValidatorsCreated(bytes32 messageID, address[] hosts);

    function addCandidate(address host, bytes32 guest) external notHostCandidateExists(host) notGuestCandidateExists(guest)  {
        CandidateValidator memory c = CandidateValidator(host, guest, true);
        candidates[host] = c;
        guestCandidates[guest] = true;
        emit AddCandidateValidator(keccak256(abi.encodePacked(now)), host, guest);
    }

    function removeCandidate(address host) external hostCandidateExists(host) {
        candidates[host].isExists = false;
        guestCandidates[candidates[host].guest] = false;
        emit RemoveCandidateValidator(keccak256(abi.encodePacked(now)), host, candidates[host].guest);
    }
    
    function createCandidatesValidatorsProposal(address[] calldata hosts) external {
        require(hosts.length <= 10, "Host lenth is long");

        bool notHostExists = false;

        for (uint i = 0; i < hosts.length; i++) {
            if (!isCandidateExists(hosts[i])) {
                notHostExists = true;
            }
        }

        if (!notHostExists) {
            bytes32 proposalID = keccak256(abi.encodePacked(now));
            ValidatorsListProposal memory v = ValidatorsListProposal(proposalID, hosts, true);
            validatorsCandidatesPropoposals[proposalID] = v;
            emit ProposalCandidatesValidatorsCreated(proposalID, hosts);
        }
    }

    modifier hostCandidateExists(address host) {
        require(candidates[host].isExists, "Host is not exists");
        _;
    }

    modifier notHostCandidateExists(address host) {
        require(!candidates[host].isExists, "Host is exists");
        _;
    }

    modifier notGuestCandidateExists(bytes32 guest) {
        require(!guestCandidates[guest], "Guest is Exists");
        _;
    }

    function initialize() initializer public {}

    function isCandidateExists(address host) public view returns(bool) {
        return candidates[host].isExists;
    }

    function getGuestAddress(address host) public view returns(bytes32) {
        require(candidates[host].isExists, "Key is not exists");

        return candidates[host].guest;
    }
}