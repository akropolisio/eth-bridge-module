import {TransfersInstance, TransfersContract, ERC20MockContract, StatusInstance, LimitsInstance, ERC20MockInstance } from "../../types/truffle-contracts/index";
import EVMRevert from "../helpers/EVMRevert";

// tslint:disable-next-line:no-var-requires
const { BN, constants, expectEvent, shouldFail } = require("@openzeppelin/test-helpers");

// tslint:disable-next-line:no-var-requires
require("chai").use(require("chai-as-promised")).should();

const TransferContract = artifacts.require("Transfers");
const ERC20Contract = artifacts.require("ERC20Mock");
const BridgeStatus = artifacts.require("Status");
const BridgeLimits = artifacts.require("Limits");

contract("Transfers", async ([_, owner,  wallet1, wallet2, wallet3, wallet4, wallet5]) => {
    let transfer: TransfersInstance;
    let erc20: ERC20MockInstance;
    let limits: LimitsInstance;
    let status: StatusInstance;

    beforeEach(async function() {
        limits = await BridgeLimits.new();  
        await limits.init(); 

        status = await BridgeStatus.new();  
        status.init(); 

        erc20 = await ERC20Contract.new(owner, 100000000000);
        transfer = await TransferContract.new();  
        await transfer.init(erc20.address, status.address, limits.address, {from: owner});
        await erc20.approve(transfer.address, 100000000000, {from: owner}); 
    });

    it("setTransfer => true", async () => {
        await transfer.setTransfer(10, owner, web3.utils.asciiToHex("32"), {from: owner});
    });

    it("revertTransfer => true", async () => {
        await transfer.setTransfer(10, owner, web3.utils.asciiToHex("32"), {from: owner});
        await transfer.revertTransfer(await transfer._getFirstMessageIDByAddress(owner), {from: owner});
    });

    it("approveTransfer => true", async () => {
        await transfer.setTransfer(10, owner, web3.utils.asciiToHex("32"), {from: owner});
        await transfer.approveTransfer(await transfer._getFirstMessageIDByAddress(owner), owner, web3.utils.asciiToHex("32"), 10, {from: owner});
    });

    it("confirmTransfer => true", async () => {
        await transfer.setTransfer(10, owner, web3.utils.asciiToHex("32"), {from: owner});
        await transfer.approveTransfer(await transfer._getFirstMessageIDByAddress(owner), owner, web3.utils.asciiToHex("32"), 10, {from: owner});
        await transfer.confirmTransfer(await transfer._getFirstMessageIDByAddress(owner), {from: owner});
    });

    it("revertTransfer => true", async () => {
        await transfer.setTransfer(10, owner, web3.utils.asciiToHex("32"), {from: owner});
        await transfer.revertTransfer(await transfer._getFirstMessageIDByAddress(owner), {from: owner});
        await transfer.confirmCancelTransfer(await transfer._getFirstMessageIDByAddress(owner), {from: owner});
    });

    it("withdrawTransfer => true", async () => {
        await transfer.setTransfer(10, owner, web3.utils.asciiToHex("32"), {from: owner});
        await transfer.withdrawTransfer(web3.utils.asciiToHex("32"), web3.utils.asciiToHex("32"), owner, 10, {from: owner});
        await transfer.confirmWithdrawTransfer(web3.utils.asciiToHex("32"), {from: owner});
    });
});
