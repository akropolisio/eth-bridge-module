pragma solidity ^0.5.12;

contract ICandidate {

    function addCandidate(address host, bytes32 guest) external;
    function removeCandidate(address host) external;
    function createCandidatesValidatorsProposal(address[] calldata hosts) external;
    function isCandidateExists(address host) public view returns(bool);
    function getGuestAddress(address host) public view returns(bytes32);
}