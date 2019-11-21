pragma solidity ^0.5.12;


contract Candidate {

    struct ValidatorsListProposal {
        bytes32 proposalID;
        address[] candidates;
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

    modifier hostCandidateExists(address host) {
        require(!candidates[host].isExists, "Host is not exists");
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

    function isCandidateExists(address host) public view returns(bool) {
        return candidates[host].isExists;
    }

    function getGuestAddress(address host) public view returns(bytes32) {
        require(candidates[host].isExists, "Key is not exists");

        return candidates[host].guest;
    }

    function _addCandidate(address host, bytes32 guest) internal notHostCandidateExists(host) notGuestCandidateExists(guest)  {
        CandidateValidator memory c = CandidateValidator(host, guest, true);
        candidates[host] = c;
        guestCandidates[guest] = true;
        emit AddCandidateValidator(keccak256(abi.encodePacked(now)), host, guest);
    }

    function _removeCandidate(address host) internal hostCandidateExists(host) {
        candidates[host].isExists = false;
        guestCandidates[candidates[host].guest] = false;
        emit RemoveCandidateValidator(keccak256(abi.encodePacked(now)), host, candidates[host].guest);
    }

    function _createCandidateValidatorProposal(address[] memory hosts) internal {
        require(hosts.length <= 10, "Host lenth is long");

        bool notHostExists = false;

        for (uint i = 0; i < hosts.length; i++) {
            if (!isCandidateExists(hosts[i])) {
                notHostExists = true;
            }
        }
        require(notHostExists, "One or more host are not a candidate");

        bytes32 proposalID = keccak256(abi.encodePacked(now));
        ValidatorsListProposal memory v = ValidatorsListProposal(proposalID, hosts, true);
        validatorsCandidatesPropoposals[proposalID] = v;
        emit ProposalCandidatesValidatorsCreated(proposalID, hosts);
    }
}