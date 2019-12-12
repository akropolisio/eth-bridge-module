pragma solidity ^0.5.12;

contract ITransfers {
    function setTransfer(uint amount, address owner, bytes32 guestAddress) external;
    function revertTransfer(bytes32 messageID) external;
    function approveTransfer(bytes32 messageID, address spender, bytes32 guestAddress, uint availableAmount) external;
    function confirmTransfer(bytes32 messageID) external;
    function withdrawTransfer(bytes32 messageID, bytes32  sender, address recipient, uint availableAmount) external;
    function confirmWithdrawTransfer(bytes32 messageID) external;
    function confirmCancelTransfer(bytes32 messageID) external;

    function getMessageStatus(bytes32 messageID) public view returns (uint);
    function isExistsMessage(bytes32 messageID) public view returns (bool);
    function getHost(bytes32 messageID) public view returns (address);
    function getGuest(bytes32 messageID) public view returns (bytes32);
    function getAvailableAmount(bytes32 messageID) public view returns (uint);

}