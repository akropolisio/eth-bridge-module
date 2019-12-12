pragma solidity ^0.5.12;

contract IDao  {
    function createProposal(uint[10] calldata parameters) external;
    function approvedNewProposal(bytes32 proposalID) external;
}