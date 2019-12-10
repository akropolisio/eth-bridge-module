import {LimitsInstance, LimitsContract } from "../../types/truffle-contracts/index";
import EVMRevert from "../helpers/EVMRevert";
import BigNumber from "bignumber.js";

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

    it("get init parameters", async () => {

        await limits.setLimits(10, 10, 10, 10, 10, 10, 10, 10, 10, 10);

        let limitValue = new Array<BigNumber>(10);
        limitValue = await limits.getLimits();
        
        limitValue[0].toNumber().should.be.equal(10); 
        limitValue[1].toNumber().should.be.equal(10);
        limitValue[2].toNumber().should.be.equal(10);
        limitValue[3].toNumber().should.be.equal(10);
        limitValue[4].toNumber().should.be.equal(10);
        limitValue[5].toNumber().should.be.equal(10);
        limitValue[6].toNumber().should.be.equal(10);
        limitValue[7].toNumber().should.be.equal(10);
        limitValue[8].toNumber().should.be.equal(10);
        limitValue[9].toNumber().should.be.equal(10);
     });
});