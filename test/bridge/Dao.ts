import {LimitsInstance, LimitsContract, DaoInstance } from "../../types/truffle-contracts/index";
import EVMRevert from "../helpers/EVMRevert";

// tslint:disable-next-line:no-var-requires
const { BN, constants, expectEvent, shouldFail } = require("@openzeppelin/test-helpers");

// tslint:disable-next-line:no-var-requires
require("chai").use(require("chai-as-promised")).should();


const BridgeLimits = artifacts.require("Limits");
const DaoContract = artifacts.require("Dao");


contract("Dao", async ([_, owner,  wallet1, wallet2, wallet3, wallet4, wallet5]) => {
    let limits: LimitsInstance;
    let dao: DaoInstance;

    beforeEach(async function() {
        limits = await BridgeLimits.new();  
        await limits.init({from: owner}); 
        dao = await DaoContract.new();
        await dao.init(limits.address, {from: owner});
     });

     it("get init parameters", async () => {

        await limits.setLimits(10, 10, 10, 10, 10, 10, 10, 10, 10, 10, {from: owner});

        let limitValue = new Array<BN>(10);
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

     it("set proposal parameters", async () => {
        
        
        await limits.transferOwnership(dao.address, {from:owner});

        await dao.createProposal([100, 100, 100, 100, 100, 100, 100, 100, 100, 100], {from: owner});

        await dao.approvedNewProposal(await dao._getFirstMessageIDByAddress(), {from: owner});

        let limitValue = await limits.getLimits();

        limitValue[0].toNumber().should.be.equal(100); 
        limitValue[1].toNumber().should.be.equal(100);
        limitValue[2].toNumber().should.be.equal(100);
        limitValue[3].toNumber().should.be.equal(100);
        limitValue[4].toNumber().should.be.equal(100);
        limitValue[5].toNumber().should.be.equal(100);
        limitValue[6].toNumber().should.be.equal(100);
        limitValue[7].toNumber().should.be.equal(100);
        limitValue[8].toNumber().should.be.equal(100);
        limitValue[9].toNumber().should.be.equal(100)
     });     
});