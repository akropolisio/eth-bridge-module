pragma solidity ^0.5.12;

contract ITransfers {
    function setTransfer(uint amount, bytes32 guestAddress) external;
    function revertTransfer(bytes32 messageID) external;
    function approveTransfer(bytes32 messageID, address spender, bytes32 guestAddress, uint availableAmount) external;
    function confirmTransfer(bytes32 messageID) external;
    function withdrawTransfer(bytes32 messageID, bytes32  sender, address recipient, uint availableAmount) external;
    function confirmWithdrawTransfer(bytes32 messageID) external;
    function confirmCancelTransfer(bytes32 messageID) external;
}