import {BridgeInstance, CandidateInstance, LimitsInstance, DaoInstance, StatusInstance, TransfersInstance, ERC20MockInstance } from "../../types/truffle-contracts/index";
import EVMRevert from "../helpers/EVMRevert";
import { formatBytes32String } from "ethers/utils";


// tslint:disable-next-line:no-var-requires
const { BN, constants, expectEvent, shouldFail } = require("@openzeppelin/test-helpers");

// tslint:disable-next-line:no-var-requires
require("chai").use(require("chai-as-promised")).should();

const TransferContract = artifacts.require("Transfers");
const ERC20Contract = artifacts.require("ERC20Mock");
const BridgeStatus = artifacts.require("Status");
const BridgeLimits = artifacts.require("Limits");
const DaoContract = artifacts.require("Dao");
const CandidateContract = artifacts.require("Candidate");
const BridgeContract = artifacts.require("Bridge");

contract("BridgeContract", async ([_, owner,  wallet1, wallet2, wallet3, wallet4, wallet5]) => {
    let limits: LimitsInstance;
    let dao: DaoInstance;
    let status: StatusInstance;
    let transfer: TransfersInstance;
    let erc20: ERC20MockInstance;
    let candidate: CandidateInstance;
    let bridge: BridgeInstance;

    beforeEach(async function() {
       
        limits = await BridgeLimits.new();  
        await limits.init();
        
        status = await BridgeStatus.new();  
        status.init(); 
       

        erc20 = await ERC20Contract.new(owner, 100000000000);
        
        transfer = await TransferContract.new();  
        await transfer.init(erc20.address, status.address, limits.address);

        dao = await DaoContract.new();
        await dao.init(limits.address);

        
        
        await erc20.approve(transfer.address, 100000000000, {from: owner})

        candidate = await CandidateContract.new();  
        candidate.initialize(); 

        bridge = await BridgeContract.new();
        bridge.initialize(status.address, transfer.address, dao.address, candidate.address);

       
        await erc20.approve(bridge.address, 100000000000, {from: owner});

        await status.transferOwnership(bridge.address);
        await transfer.transferOwnership(bridge.address);
        await dao.transferOwnership(bridge.address);
        await candidate.transferOwnership(bridge.address);

     });

     it("get init parameters", async () => {

        await limits.setLimits(10, 10, 10, 10, 10, 10, 10, 10, 10, 10);

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

     it("setTransfer => true", async () => {
        await bridge.setTransfer(10, web3.utils.asciiToHex("32"), {from: owner});
    });

     it("should be initialized correctly", async () => {
        (await bridge.validators(0)).should.be.equal(_);
        (await bridge.validatorsCount()).toNumber().should.be.equal(1);

        (await bridge.isExistValidator(_)).should.be.true;
        (await bridge.isExistValidator(wallet1)).should.be.false;
        (await bridge.isExistValidator(wallet2)).should.be.false;
        (await bridge.isExistValidator(wallet3)).should.be.false;
        (await bridge.isExistValidator(wallet4)).should.be.false;
        (await bridge.isExistValidator(wallet5)).should.be.false;
    });
  
   it("should transfer validatorship 1 => 1 correctly", async () => {
        await bridge.changeValidators([wallet1]);

        (await bridge.validators(0)).should.be.equal(wallet1);
        (await bridge.validatorsCount()).toNumber().should.be.equal(1);

        (await bridge.isExistValidator(_)).should.be.false;
        (await bridge.isExistValidator(wallet1)).should.be.true;
        (await bridge.isExistValidator(wallet2)).should.be.false;
        (await bridge.isExistValidator(wallet3)).should.be.false;
        (await bridge.isExistValidator(wallet4)).should.be.false;
        (await bridge.isExistValidator(wallet5)).should.be.false;
    });

   it("should transfer validatorship 1 => 2 correctly", async () => {
        await bridge.changeValidators([wallet1, wallet2]);
        (await bridge.validators(0)).should.be.equal(wallet1);
        (await bridge.validators(1)).should.be.equal(wallet2);
        (await bridge.validatorsCount()).toNumber().should.be.equal(2);

        (await bridge.isExistValidator(_)).should.be.false;
        (await bridge.isExistValidator(wallet1)).should.be.true;
        (await bridge.isExistValidator(wallet2)).should.be.true;
        (await bridge.isExistValidator(wallet3)).should.be.false;
        (await bridge.isExistValidator(wallet4)).should.be.false;
        (await bridge.isExistValidator(wallet5)).should.be.false;
    });

   it("should transfer validatorship 1 => 3 correctly", async () => {
        await bridge.changeValidators([wallet1, wallet2, wallet3]);

        (await bridge.validators(0)).should.be.equal(wallet1);
        (await bridge.validators(1)).should.be.equal(wallet2);
        (await bridge.validators(2)).should.be.equal(wallet3);
        (await bridge.validatorsCount()).toNumber().should.be.equal(3);

        (await bridge.isExistValidator(_)).should.be.false;
        (await bridge.isExistValidator(wallet1)).should.be.true;
        (await bridge.isExistValidator(wallet2)).should.be.true;
        (await bridge.isExistValidator(wallet3)).should.be.true;
        (await bridge.isExistValidator(wallet4)).should.be.false;
        (await bridge.isExistValidator(wallet5)).should.be.false;
    });

   it("should transfer validatorship 2 => 1 correctly", async () => {
        await bridge.changeValidators([wallet1, wallet2]);
        (await bridge.validatorsCount()).toNumber().should.be.equal(2);

        await bridge.changeValidators([wallet3], { from: wallet1 });
        await bridge.changeValidators([wallet3], { from: wallet2 });
        (await bridge.validators(0)).should.be.equal(wallet3);
        (await bridge.validatorsCount()).toNumber().should.be.equal(1);
        (await bridge.isExistValidator(_)).should.be.false;
        (await bridge.isExistValidator(wallet1)).should.be.false;
        (await bridge.isExistValidator(wallet2)).should.be.false;
        (await bridge.isExistValidator(wallet3)).should.be.true;
        (await bridge.isExistValidator(wallet4)).should.be.false;
        (await bridge.isExistValidator(wallet5)).should.be.false;
    });

   it("should transfer validatorship 3 => 1 correctly", async () => {
        await bridge.changeValidators([wallet1, wallet2, wallet3]);
        await bridge.changeValidators([wallet4], { from: wallet1 });
        await bridge.changeValidators([wallet4], { from: wallet2 });
        await bridge.changeValidators([wallet4], { from: wallet3 });

        (await bridge.validators(0)).should.be.equal(wallet4);
        (await bridge.validatorsCount()).toNumber().should.be.equal(1);

        (await bridge.isExistValidator(_)).should.be.false;
        (await bridge.isExistValidator(wallet1)).should.be.false;
        (await bridge.isExistValidator(wallet2)).should.be.false;
        (await bridge.isExistValidator(wallet3)).should.be.false;
        (await bridge.isExistValidator(wallet4)).should.be.true;
        (await bridge.isExistValidator(wallet5)).should.be.false;
    });

   it("should transfer validatorship 2 => 2 correctly", async () => {
        await bridge.changeValidators([wallet1, wallet2]);
        await bridge.changeValidators([wallet3, wallet4], { from: wallet1 });
        await bridge.changeValidators([wallet3, wallet4], { from: wallet2 });

        (await bridge.validators(0)).should.be.equal(wallet3);
        (await bridge.validators(1)).should.be.equal(wallet4);
        (await bridge.validatorsCount()).toNumber().should.be.equal(2);

        (await bridge.isExistValidator(_)).should.be.false;
        (await bridge.isExistValidator(wallet1)).should.be.false;
        (await bridge.isExistValidator(wallet2)).should.be.false;
        (await bridge.isExistValidator(wallet3)).should.be.true;
        (await bridge.isExistValidator(wallet4)).should.be.true;
        (await bridge.isExistValidator(wallet5)).should.be.false;
    });

   it("should transfer validatorship 2 => 3 correctly", async () => {
        await bridge.changeValidators([wallet1, wallet2]);
        await bridge.changeValidators([wallet3, wallet4, wallet5], { from: wallet1 });
        await bridge.changeValidators([wallet3, wallet4, wallet5], { from: wallet2 });

        (await bridge.validators(0)).should.be.equal(wallet3);
        (await bridge.validators(1)).should.be.equal(wallet4);
        (await bridge.validators(2)).should.be.equal(wallet5);
        (await bridge.validatorsCount()).toNumber().should.be.equal(3);

        (await bridge.isExistValidator(_)).should.be.false;
        (await bridge.isExistValidator(wallet1)).should.be.false;
        (await bridge.isExistValidator(wallet2)).should.be.false;
        (await bridge.isExistValidator(wallet3)).should.be.true;
        (await bridge.isExistValidator(wallet4)).should.be.true;
        (await bridge.isExistValidator(wallet5)).should.be.true;
    });

   it("should transfer validatorship 3 => 2 correctly", async () => {
        await bridge.changeValidators([wallet1, wallet2, wallet3]);
        await bridge.changeValidators([wallet4, wallet5], { from: wallet1 });
        await bridge.changeValidators([wallet4, wallet5], { from: wallet2 });
        await bridge.changeValidators([wallet4, wallet5], { from: wallet3 });

        (await bridge.validators(0)).should.be.equal(wallet4);
        (await bridge.validators(1)).should.be.equal(wallet5);
        (await bridge.validatorsCount()).toNumber().should.be.equal(2);

        (await bridge.isExistValidator(_)).should.be.false;
        (await bridge.isExistValidator(wallet1)).should.be.false;
        (await bridge.isExistValidator(wallet2)).should.be.false;
        (await bridge.isExistValidator(wallet3)).should.be.false;
        (await bridge.isExistValidator(wallet4)).should.be.true;
        (await bridge.isExistValidator(wallet5)).should.be.true;
    });

   it("should transfer validatorship 1,2 of 3 => 2 correctly", async () => {
        await bridge.changeValidatorsWithHowMany([wallet1, wallet2, wallet3], 2);
        await bridge.changeValidators([wallet4, wallet5], { from: wallet1 });
        await bridge.changeValidators([wallet4, wallet5], { from: wallet2 });

        (await bridge.validators(0)).should.be.equal(wallet4);
        (await bridge.validators(1)).should.be.equal(wallet5);
        (await bridge.validatorsCount()).toNumber().should.be.equal(2);
    });

   it("should transfer validatorship 2,3 of 3 => 2 correctly", async () => {
        await bridge.changeValidatorsWithHowMany([wallet1, wallet2, wallet3], 2);
        await bridge.changeValidators([wallet4, wallet5], { from: wallet2 });
        await bridge.changeValidators([wallet4, wallet5], { from: wallet3 });

        (await bridge.validators(0)).should.be.equal(wallet4);
        (await bridge.validators(1)).should.be.equal(wallet5);
        (await bridge.validatorsCount()).toNumber().should.be.equal(2);
    });

   it("should transfer validatorship 5 => 3 correctly", async () => {
        await bridge.changeValidatorsWithHowMany([wallet1, wallet2, wallet3, wallet4, wallet5], 3);
        (await bridge.validators(0)).should.be.equal(wallet1);
        (await bridge.validators(1)).should.be.equal(wallet2);
        await bridge.changeValidators([wallet4, wallet5], { from: wallet1 });
        await bridge.changeValidators([wallet4, wallet5], { from: wallet2 });
        await bridge.changeValidators([wallet4, wallet5], { from: wallet3 });
        (await bridge.validatorsCount()).toNumber().should.be.equal(2);
    });

   it("should transfer validatorship 1,3 of 3 => 2 correctly", async () => {
        await bridge.changeValidatorsWithHowMany([wallet1, wallet2, wallet3], 2);
        await bridge.changeValidators([wallet4, wallet5], { from: wallet1 });
        await bridge.changeValidators([wallet4, wallet5], { from: wallet3 });

        (await bridge.validators(0)).should.be.equal(wallet4);
        (await bridge.validators(1)).should.be.equal(wallet5);
        (await bridge.validatorsCount()).toNumber().should.be.equal(2);
    });

  
    it("should not transfer validatorship with wrong how many argument", async () => {
        await bridge.changeValidatorsWithHowMany([wallet1], 0).should.be.rejectedWith(EVMRevert);
        await bridge.changeValidatorsWithHowMany([wallet1, wallet2], 3).should.be.rejectedWith(EVMRevert);
        await bridge.changeValidatorsWithHowMany([wallet1, wallet2], 4).should.be.rejectedWith(EVMRevert);
    });

   it("should correctly manage allOperations array", async () => {
        // Transfer validatorship 1 => 1
        (await bridge.allOperationsCount()).toNumber().should.be.equal(0);
        await bridge.changeValidators([wallet1]);
        (await bridge.allOperationsCount()).toNumber().should.be.equal(0);

        // Transfer validatorship 1 => 2
        (await bridge.allOperationsCount()).toNumber().should.be.equal(0);
        await bridge.changeValidators([wallet2, wallet3], { from: wallet1 });
        (await bridge.allOperationsCount()).toNumber().should.be.equal(0);

        // Transfer validatorship 2 => 2
        (await bridge.allOperationsCount()).toNumber().should.be.equal(0);
        await bridge.changeValidators([wallet4, wallet5], { from: wallet2 });
        (await bridge.allOperationsCount()).toNumber().should.be.equal(1);
        await bridge.changeValidators([wallet4, wallet5], { from: wallet3 });
        (await bridge.allOperationsCount()).toNumber().should.be.equal(0);
    });

});
