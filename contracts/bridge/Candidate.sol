pragma solidity ^0.5.12;


contract Candidate is  ValidatorsOperations {

    struct ValidatorsListProposal {
        bytes messageID;
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

    event AddCandidateValidator(bytes32 messageID, address host, bytes32 guest);
    event RemoveCandidateValidator(bytes32 messageID, address host, bytes32 guest);

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

    function isCandidateExists(address host) public view returns(bool) {
        return candidates[host].isExists;
    }

    function getGuestAddress(address host) public view returns(bytes32) {
        require(candidates[host].isExists, "Key is not exists");

        return candidates[host].guest;
    }


}