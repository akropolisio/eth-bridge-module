import {TransfersInstance, TransfersContract, ERC20MockContract, ERC20MockInstance } from "../../types/truffle-contracts/index";
import EVMRevert from "../helpers/EVMRevert";

// tslint:disable-next-line:no-var-requires
const { BN, constants, expectEvent, shouldFail } = require("@openzeppelin/test-helpers");

// tslint:disable-next-line:no-var-requires
require("chai").use(require("chai-as-promised")).should();

const TransferContract = artifacts.require("Transfers");
const ERC20Contract = artifacts.require("ERC20Mock");

contract("Candidate", async ([_, owner,  wallet1, wallet2, wallet3, wallet4, wallet5]) => {
    let transfer: TransfersInstance;
    let erc20: ERC20MockInstance;

    beforeEach(async function() {

        erc20 = await ERC20Contract.new(owner, 100000000000);
        transfer = await TransferContract.new();  
        transfer.initialize(erc20.address);
        erc20.approve(transfer.address, 100000000000); 
    });

    it("setTransfer => true", async () => {
        
    });
});
