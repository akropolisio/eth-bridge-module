import { ValidatorOperationsImplInstance, ValidatorsOperationsInstance, ValidatorsOperationsMockInstance } from "../types/truffle-contracts/index";
import EVMRevert from "./helpers/EVMRevert";

// tslint:disable-next-line:no-var-requires
const { BN, constants, expectEvent, shouldFail } = require("@openzeppelin/test-helpers");

// tslint:disable-next-line:no-var-requires
require("chai").use(require("chai-as-promised")).should();

// tslint:disable-next-line:variable-name
const ValidatorsOperations = artifacts.require("ValidatorsOperations");

const ValidatorsOperationsMock = artifacts.require("ValidatorsOperationsMock");

contract("ValidatorsOperation", async ([_, owner,  wallet1, wallet2, wallet3, wallet4, wallet5]) => {
   let validatorsOperations: ValidatorsOperationsInstance;
   let validatorsOperationsMock: ValidatorsOperationsMockInstance;
  
   beforeEach(async function() {
      validatorsOperations = await ValidatorsOperations.new();
      validatorsOperationsMock = await ValidatorsOperationsMock.new();
    });


  
   it("should be initialized correctly", async () => {
        (await validatorsOperations.validators(0)).should.be.equal(_);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(1);

        (await validatorsOperations.isExistValidator(_)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet1)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet2)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet3)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet4)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet5)).should.be.false;
    });
  
   it("should transfer validatorship 1 => 1 correctly", async () => {
        await validatorsOperations.transferValidatorShip([wallet1]);

        (await validatorsOperations.validators(0)).should.be.equal(wallet1);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(1);

        (await validatorsOperations.isExistValidator(_)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet1)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet2)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet3)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet4)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet5)).should.be.false;
    });

   it("should transfer validatorship 1 => 2 correctly", async () => {
        await validatorsOperations.transferValidatorShip([wallet1, wallet2]);
        (await validatorsOperations.validators(0)).should.be.equal(wallet1);
        (await validatorsOperations.validators(1)).should.be.equal(wallet2);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(2);

        (await validatorsOperations.isExistValidator(_)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet1)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet2)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet3)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet4)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet5)).should.be.false;
    });

   it("should transfer validatorship 1 => 3 correctly", async () => {
        await validatorsOperations.transferValidatorShip([wallet1, wallet2, wallet3]);

        (await validatorsOperations.validators(0)).should.be.equal(wallet1);
        (await validatorsOperations.validators(1)).should.be.equal(wallet2);
        (await validatorsOperations.validators(2)).should.be.equal(wallet3);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(3);

        (await validatorsOperations.isExistValidator(_)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet1)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet2)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet3)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet4)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet5)).should.be.false;
    });

   it("should transfer validatorship 2 => 1 correctly", async () => {
        await validatorsOperations.transferValidatorShip([wallet1, wallet2]);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(2);

        await validatorsOperations.transferValidatorShip([wallet3], { from: wallet1 });
        await validatorsOperations.transferValidatorShip([wallet3], { from: wallet2 });
        (await validatorsOperations.validators(0)).should.be.equal(wallet3);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(1);
        (await validatorsOperations.isExistValidator(_)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet1)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet2)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet3)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet4)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet5)).should.be.false;
    });

   it("should transfer validatorship 3 => 1 correctly", async () => {
        await validatorsOperations.transferValidatorShip([wallet1, wallet2, wallet3]);
        await validatorsOperations.transferValidatorShip([wallet4], { from: wallet1 });
        await validatorsOperations.transferValidatorShip([wallet4], { from: wallet2 });
        await validatorsOperations.transferValidatorShip([wallet4], { from: wallet3 });

        (await validatorsOperations.validators(0)).should.be.equal(wallet4);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(1);

        (await validatorsOperations.isExistValidator(_)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet1)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet2)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet3)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet4)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet5)).should.be.false;
    });

   it("should transfer validatorship 2 => 2 correctly", async () => {
        await validatorsOperations.transferValidatorShip([wallet1, wallet2]);
        await validatorsOperations.transferValidatorShip([wallet3, wallet4], { from: wallet1 });
        await validatorsOperations.transferValidatorShip([wallet3, wallet4], { from: wallet2 });

        (await validatorsOperations.validators(0)).should.be.equal(wallet3);
        (await validatorsOperations.validators(1)).should.be.equal(wallet4);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(2);

        (await validatorsOperations.isExistValidator(_)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet1)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet2)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet3)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet4)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet5)).should.be.false;
    });

   it("should transfer validatorship 2 => 3 correctly", async () => {
        await validatorsOperations.transferValidatorShip([wallet1, wallet2]);
        await validatorsOperations.transferValidatorShip([wallet3, wallet4, wallet5], { from: wallet1 });
        await validatorsOperations.transferValidatorShip([wallet3, wallet4, wallet5], { from: wallet2 });

        (await validatorsOperations.validators(0)).should.be.equal(wallet3);
        (await validatorsOperations.validators(1)).should.be.equal(wallet4);
        (await validatorsOperations.validators(2)).should.be.equal(wallet5);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(3);

        (await validatorsOperations.isExistValidator(_)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet1)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet2)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet3)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet4)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet5)).should.be.true;
    });

   it("should transfer validatorship 3 => 2 correctly", async () => {
        await validatorsOperations.transferValidatorShip([wallet1, wallet2, wallet3]);
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet1 });
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet2 });
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet3 });

        (await validatorsOperations.validators(0)).should.be.equal(wallet4);
        (await validatorsOperations.validators(1)).should.be.equal(wallet5);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(2);

        (await validatorsOperations.isExistValidator(_)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet1)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet2)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet3)).should.be.false;
        (await validatorsOperations.isExistValidator(wallet4)).should.be.true;
        (await validatorsOperations.isExistValidator(wallet5)).should.be.true;
    });

   it("should transfer validatorship 1,2 of 3 => 2 correctly", async () => {
        await validatorsOperations.transferValidatorShipWithHowMany([wallet1, wallet2, wallet3], 2);
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet1 });
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet2 });

        (await validatorsOperations.validators(0)).should.be.equal(wallet4);
        (await validatorsOperations.validators(1)).should.be.equal(wallet5);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(2);
    });

   it("should transfer validatorship 2,3 of 3 => 2 correctly", async () => {
        await validatorsOperations.transferValidatorShipWithHowMany([wallet1, wallet2, wallet3], 2);
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet2 });
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet3 });

        (await validatorsOperations.validators(0)).should.be.equal(wallet4);
        (await validatorsOperations.validators(1)).should.be.equal(wallet5);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(2);
    });

   it("should transfer validatorship 5 => 3 correctly", async () => {
        await validatorsOperations.transferValidatorShipWithHowMany([wallet1, wallet2, wallet3, wallet4, wallet5], 3);
        (await validatorsOperations.validators(0)).should.be.equal(wallet1);
        (await validatorsOperations.validators(1)).should.be.equal(wallet2);
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet1 });
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet2 });
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet3 });
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(2);
    });

   it("should transfer validatorship 1,3 of 3 => 2 correctly", async () => {
        await validatorsOperations.transferValidatorShipWithHowMany([wallet1, wallet2, wallet3], 2);
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet1 });
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet3 });

        (await validatorsOperations.validators(0)).should.be.equal(wallet4);
        (await validatorsOperations.validators(1)).should.be.equal(wallet5);
        (await validatorsOperations.validatorsCount()).toNumber().should.be.equal(2);
    });

  
   it("should not transfer validatorship with wrong how many argument", async () => {
        await validatorsOperations.transferValidatorShipWithHowMany([wallet1], 0).should.be.rejectedWith(EVMRevert);
        await validatorsOperations.transferValidatorShipWithHowMany([wallet1, wallet2], 3).should.be.rejectedWith(EVMRevert);
        await validatorsOperations.transferValidatorShipWithHowMany([wallet1, wallet2], 4).should.be.rejectedWith(EVMRevert);
    });

   it("should correctly manage allOperations array", async () => {
        // Transfer validatorship 1 => 1
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(0);
        await validatorsOperations.transferValidatorShip([wallet1]);
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(0);

        // Transfer validatorship 1 => 2
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(0);
        await validatorsOperations.transferValidatorShip([wallet2, wallet3], { from: wallet1 });
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(0);

        // Transfer validatorship 2 => 2
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(0);
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet2 });
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(1);
        await validatorsOperations.transferValidatorShip([wallet4, wallet5], { from: wallet3 });
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(0);
    });

   it("should allow to cancel pending operations", async () => {
      
        await validatorsOperations.transferValidatorShip([wallet1, wallet2, wallet3]);

        // First owner agree
        await validatorsOperations.transferValidatorShip([wallet4], { from: wallet1 });
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(1);

        // First owner disagree
        const operation1 = await validatorsOperations.allOperations(0);
        await validatorsOperations.cancelPending(operation1, { from: wallet1 });
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(0);

        // First and Second validators agree
        await validatorsOperations.transferValidatorShip([wallet4], { from: wallet1 });
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(1);
        await validatorsOperations.transferValidatorShip([wallet4], { from: wallet2 });
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(1);

        // Second owner disagree
        const operation2 = await validatorsOperations.allOperations(0);
        await validatorsOperations.cancelPending(operation2, { from: wallet2 });
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(1);

        // Third owner agree
        await validatorsOperations.transferValidatorShip([wallet4], { from: wallet3 });
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(1);

        // Second owner agree
        await validatorsOperations.transferValidatorShip([wallet4], { from: wallet2 });
        (await validatorsOperations.allOperationsCount()).toNumber().should.be.equal(0);
    });

   it("should reset all pending operations when validators change", async () => {
        
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2]);

        await validatorsOperationsMock.setValue(1, { from: wallet1 });
        (await validatorsOperationsMock.allOperationsCount()).toNumber().should.be.equal(1);

        await validatorsOperationsMock.transferValidatorShip([wallet3], { from: wallet1 });
        (await validatorsOperationsMock.allOperationsCount()).toNumber().should.be.equal(2);

        await validatorsOperationsMock.transferValidatorShip([wallet3], { from: wallet2 });
        (await validatorsOperationsMock.allOperationsCount()).toNumber().should.be.equal(0);
    });

   it("should correctly perform last operation", async () => {
       
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2]);

        await validatorsOperationsMock.setValue(1, { from: wallet1 });
        (await validatorsOperationsMock.allOperationsCount()).toNumber().should.be.equal(1);

        await validatorsOperationsMock.transferValidatorShip([wallet3], { from: wallet1 });
        (await validatorsOperationsMock.allOperationsCount()).toNumber().should.be.equal(2);

        await validatorsOperationsMock.transferValidatorShip([wallet3], { from: wallet2 });
        (await validatorsOperationsMock.validators(0)).should.be.equal(wallet3);
    });

   it("should correctly perform not last operation", async () => {
       
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2]);

        await validatorsOperationsMock.setValue(1, { from: wallet1 });
        (await validatorsOperationsMock.allOperationsCount()).toNumber().should.be.equal(1);

        await validatorsOperationsMock.transferValidatorShip([wallet3], { from: wallet1 });
        (await validatorsOperationsMock.allOperationsCount()).toNumber().should.be.equal(2);

        await validatorsOperationsMock.setValue(1, { from: wallet2 });
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(1);
    });

   it("should handle multiple simultaneous operations correctly", async () => {
      
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2]);

        // wallet1 => 1
        await validatorsOperationsMock.setValue(1, { from: wallet1 });
        (await validatorsOperationsMock.allOperationsCount()).toNumber().should.be.equal(1);

        // Check value
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(0);

        // wallet2 => 2
        await validatorsOperationsMock.setValue(2, { from: wallet2 });
        (await validatorsOperationsMock.allOperationsCount()).toNumber().should.be.equal(2);

        // Check value
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(0);

        // wallet1 => 2
        await validatorsOperationsMock.setValue(2, { from: wallet1 });
        (await validatorsOperationsMock.allOperationsCount()).toNumber().should.be.equal(1);

        // Check value
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(2);

        // wallet2 => 1
        await validatorsOperationsMock.setValue(1, { from: wallet2 });
        (await validatorsOperationsMock.allOperationsCount()).toNumber().should.be.equal(0);

        // Check value
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(1);
    });

   it("should allow to call onlyAnyValidator methods properly", async () => {
       
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2]);

        // Not validators try to call
        await validatorsOperationsMock.setValueAny(1, { from: _ }).should.be.rejectedWith(EVMRevert);
        await validatorsOperationsMock.setValueAny(1, { from: wallet3 }).should.be.rejectedWith(EVMRevert);

        // validators try to call
        await validatorsOperationsMock.setValueAny(2, { from: wallet1 }).should.be.fulfilled;
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(2);
        await validatorsOperationsMock.setValueAny(3, { from: wallet2 }).should.be.fulfilled;
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(3);
    });

   it("should allow to call onlyManyvalidators methods properly", async () => {
    
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2]);

        // Not validators try to call
        await validatorsOperationsMock.setValue(1, { from: _ }).should.be.rejectedWith(EVMRevert);
        await validatorsOperationsMock.setValue(1, { from: wallet3 }).should.be.rejectedWith(EVMRevert);

        // Single validators try to call twice
        await validatorsOperationsMock.setValue(2, { from: wallet1 }).should.be.fulfilled;
        await validatorsOperationsMock.setValue(2, { from: wallet1 }).should.be.rejectedWith(EVMRevert);
    });

   it("should allow to call onlyAllvalidators methods properly", async () => {
       
        await validatorsOperationsMock.transferValidatorShipWithHowMany([wallet1, wallet2], 1);

        // Not validators try to call
        await validatorsOperationsMock.setValueAll(1, { from: _ }).should.be.rejectedWith(EVMRevert);
        await validatorsOperationsMock.setValueAll(1, { from: wallet3 }).should.be.rejectedWith(EVMRevert);

        // Single validators try to call twice
        await validatorsOperationsMock.setValueAll(2, { from: wallet1 }).should.be.fulfilled;
        await validatorsOperationsMock.setValueAll(2, { from: wallet2 }).should.be.fulfilled;
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(2);
    });

   it("should allow to call onlySomevalidators(n) methods properly", async () => {
       
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2]);

        // Invalid arg
        await validatorsOperationsMock.setValueSome(1, 0, { from: _ }).should.be.rejectedWith(EVMRevert);
        await validatorsOperationsMock.setValueSome(1, 3, { from: _ }).should.be.rejectedWith(EVMRevert);

        // Not validators try to call
        await validatorsOperationsMock.setValueSome(1, 1, { from: _ }).should.be.rejectedWith(EVMRevert);
        await validatorsOperationsMock.setValueSome(1, 1, { from: wallet3 }).should.be.rejectedWith(EVMRevert);

        // validators try to call
        await validatorsOperationsMock.setValueSome(5, 2, { from: wallet1 }).should.be.fulfilled;
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(0);
        await validatorsOperationsMock.setValueSome(5, 2, { from: wallet2 }).should.be.fulfilled;
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(5);
    });

   it("should not allow to cancel pending of another owner", async () => {
       
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2]);

        // First owner
        await validatorsOperationsMock.setValue(2, { from: wallet1 }).should.be.fulfilled;

        // Second owner
        const operation = await validatorsOperationsMock.allOperations(0);
        await validatorsOperationsMock.cancelPending(operation, { from: wallet2 }).should.be.rejectedWith(EVMRevert);
    });

   it("should not allow to transfer validatorship to no one and to user 0", async () => {

        const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
       
        await validatorsOperations.transferValidatorShip([]).should.be.rejectedWith(EVMRevert);
        await validatorsOperations.transferValidatorShip([ZERO_ADDRESS]).should.be.rejectedWith(EVMRevert);
        await validatorsOperations.transferValidatorShip([ZERO_ADDRESS, wallet1]).should.be.rejectedWith(EVMRevert);
        await validatorsOperations.transferValidatorShip([wallet1, ZERO_ADDRESS]).should.be.rejectedWith(EVMRevert);
        await validatorsOperations.transferValidatorShip([ZERO_ADDRESS, wallet1, wallet2]).should.be.rejectedWith(EVMRevert);
        await validatorsOperations.transferValidatorShip([wallet1, ZERO_ADDRESS, wallet2]).should.be.rejectedWith(EVMRevert);
        await validatorsOperations.transferValidatorShip([wallet1, wallet2, ZERO_ADDRESS]).should.be.rejectedWith(EVMRevert);
    });

   it("should works for nested methods with onlyManyvalidators modifier", async () => {
       
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2]);

        await validatorsOperationsMock.nestedFirst(100, { from: wallet1 });
        await validatorsOperationsMock.nestedFirst(100, { from: wallet2 });

        (await validatorsOperationsMock.value()).toNumber().should.be.equal(100);
    });

   it("should works for nested methods with onlyAnyvalidators modifier", async () => {
        
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2]);

        await validatorsOperationsMock.nestedFirstAnyToAny(100, { from: wallet3 }).should.be.rejectedWith(EVMRevert);
        await validatorsOperationsMock.nestedFirstAnyToAny2(100, { from: wallet1 }).should.be.rejectedWith(EVMRevert);

        await validatorsOperationsMock.nestedFirstAnyToAny(100, { from: wallet1 });
        await validatorsOperationsMock.nestedFirstAnyToAny(100, { from: wallet2 });
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(100);
    });

   it("should works for nested methods with onlyAllvalidators modifier", async () => {
        
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2]);

        await validatorsOperationsMock.nestedFirstAllToAll(100, { from: wallet3 }).should.be.rejectedWith(EVMRevert);
        await validatorsOperationsMock.nestedFirstAllToAll2(100, { from: wallet1 }).should.be.fulfilled;
        await validatorsOperationsMock.nestedFirstAllToAll2(100, { from: wallet2 }).should.be.rejectedWith(EVMRevert);

        await validatorsOperationsMock.nestedFirstAllToAll(100, { from: wallet1 });
        await validatorsOperationsMock.nestedFirstAllToAll(100, { from: wallet2 });
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(100);
    });

   it("should works for nested methods with onlyManyvalidators => onlySomevalidators modifier", async () => {
       
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2, wallet3]);

        await validatorsOperationsMock.nestedFirstManyToSome(100, 1, { from: wallet1 });
        await validatorsOperationsMock.nestedFirstManyToSome(100, 1, { from: wallet2 });
        await validatorsOperationsMock.nestedFirstManyToSome(100, 1, { from: wallet3 });
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(100);

        await validatorsOperationsMock.nestedFirstManyToSome(200, 2, { from: wallet1 });
        await validatorsOperationsMock.nestedFirstManyToSome(200, 2, { from: wallet2 });
        await validatorsOperationsMock.nestedFirstManyToSome(200, 2, { from: wallet3 });
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(200);

        await validatorsOperationsMock.nestedFirstManyToSome(300, 3, { from: wallet1 });
        await validatorsOperationsMock.nestedFirstManyToSome(300, 3, { from: wallet2 });
        await validatorsOperationsMock.nestedFirstManyToSome(300, 3, { from: wallet3 });
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(300);
    });

   it("should works for nested methods with onlyAnyvalidators => onlySomevalidators modifier", async  () => {
      
        await validatorsOperationsMock.transferValidatorShip([wallet1, wallet2, wallet3]);

        // 1 => 1
        await validatorsOperationsMock.nestedFirstAnyToSome(100, 1, { from: wallet1 });
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(100);
        await validatorsOperationsMock.nestedFirstAnyToSome(200, 1, { from: wallet2 });
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(200);
        await validatorsOperationsMock.nestedFirstAnyToSome(300, 1, { from: wallet3 });
        (await validatorsOperationsMock.value()).toNumber().should.be.equal(300);

        // 1 => 2
        await validatorsOperationsMock.nestedFirstAnyToSome(100, 2, { from: wallet1 }).should.be.rejectedWith(EVMRevert);
        await validatorsOperationsMock.nestedFirstAnyToSome(200, 2, { from: wallet2 }).should.be.rejectedWith(EVMRevert);
        await validatorsOperationsMock.nestedFirstAnyToSome(300, 2, { from: wallet3 }).should.be.rejectedWith(EVMRevert);
    });

   it("should not allow to transfer validatorship to several equal users", async () => {
       
        await validatorsOperations.transferValidatorShip([wallet1, wallet1]).should.be.rejectedWith(EVMRevert);
        await validatorsOperations.transferValidatorShip([wallet1, wallet2, wallet1]).should.be.rejectedWith(EVMRevert);
    });

   it("should not allow to transfer validatorship to more than 256 validators", async () => {
       
        await validatorsOperations.transferValidatorShip([
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
          _,
        ]).should.be.rejectedWith(EVMRevert);
    });
});
