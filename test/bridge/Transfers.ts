import {TransfersInstance, TransfersContract, ERC20MockContract, ERC20MockInstance } from "../../types/truffle-contracts/index";
import EVMRevert from "../helpers/EVMRevert";

// tslint:disable-next-line:no-var-requires
const { BN, constants, expectEvent, shouldFail } = require("@openzeppelin/test-helpers");

// tslint:disable-next-line:no-var-requires
require("chai").use(require("chai-as-promised")).should();

const TransferContract = artifacts.require("Transfers");
const ERC20Contract = artifacts.require("ERC20Mock");

contract("Transfers", async ([_, owner,  wallet1, wallet2, wallet3, wallet4, wallet5]) => {
    let transfer: TransfersInstance;
    let erc20: ERC20MockInstance;

    beforeEach(async function() {
        erc20 = await ERC20Contract.new(owner, 100000000000);
        transfer = await TransferContract.new();  
        transfer.initialize(erc20.address);
        erc20.approve(transfer.address, 100000000000, {from: owner}); 
    });

    it("setTransfer => true", async () => {
        transfer.setTransfer(10, web3.utils.asciiToHex("32"), {from: owner});
    });

    it("revertTransfer => true", async () => {
        transfer.setTransfer(10, web3.utils.asciiToHex("32"), {from: owner});
        transfer.revertTransfer(await transfer.getFirstMessageIDByAddress(owner));
    });

    it("approveTransfer => true", async () => {
        transfer.setTransfer(10, web3.utils.asciiToHex("32"), {from: owner});
        transfer.approveTransfer(await transfer.getFirstMessageIDByAddress(owner), owner, web3.utils.asciiToHex("32"), 10);
    });

    it("confirmTransfer => true", async () => {
        transfer.setTransfer(10, web3.utils.asciiToHex("32"), {from: owner});
        transfer.approveTransfer(await transfer.getFirstMessageIDByAddress(owner), owner, web3.utils.asciiToHex("32"), 10);
        transfer.confirmTransfer(await transfer.getFirstMessageIDByAddress(owner));
    });

    it("revertTransfer => true", async () => {
        transfer.setTransfer(10, web3.utils.asciiToHex("32"), {from: owner});
        transfer.revertTransfer(await transfer.getFirstMessageIDByAddress(owner), {from: owner});
        transfer.confirmCancelTransfer(await transfer.getFirstMessageIDByAddress(owner), {from: owner});
    });

    it("withdrawTransfer => true", async () => {
        transfer.setTransfer(10, web3.utils.asciiToHex("32"), {from: owner});
        transfer.withdrawTransfer(web3.utils.asciiToHex("32"), web3.utils.asciiToHex("32"), owner, 10);
        transfer.confirmWithdrawTransfer(web3.utils.asciiToHex("32"));
    });
});
