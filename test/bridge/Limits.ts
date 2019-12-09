import {LimitsInstance, LimitsContract } from "../../types/truffle-contracts/index";
import EVMRevert from "../helpers/EVMRevert";

// tslint:disable-next-line:no-var-requires
const { BN, constants, expectEvent, shouldFail } = require("@openzeppelin/test-helpers");

// tslint:disable-next-line:no-var-requires
require("chai").use(require("chai-as-promised")).should();

const BridgeLimits = artifacts.require("Limits");

contract("BridgeLimits", async ([_, owner,  wallet1, wallet2, wallet3, wallet4, wallet5]) => {
    let limits: LimitsInstance;

    beforeEach(async function() {
       limits = await BridgeLimits.new();  
       limits.initialize(); 
    });

    
});