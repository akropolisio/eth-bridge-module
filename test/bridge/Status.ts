import {StatusInstance, StatusContract } from "../../types/truffle-contracts/index";
import EVMRevert from "../helpers/EVMRevert";

// tslint:disable-next-line:no-var-requires
const { BN, constants, expectEvent, shouldFail } = require("@openzeppelin/test-helpers");

// tslint:disable-next-line:no-var-requires
require("chai").use(require("chai-as-promised")).should();


const BridgeStatus = artifacts.require("Status");

contract("BridgeStatus", async ([_, owner,  wallet1, wallet2, wallet3, wallet4, wallet5]) => {
    let status: StatusInstance;

    beforeEach(async function() {
       status = await BridgeStatus.new();  
       status.init(); 
    });


    it("status active by default, 0 => active", async () => {
       (await status.getStatusBridge()).toNumber().should.be.equal(0);   
    });

    it("status  paused, 1 => paused", async () => {
        (await status.pauseBridge());
        (await status.getStatusBridge()).toNumber().should.be.equal(1); 
    });

    it("status  active, active => paused => active", async () => {
        (await status.pauseBridge());
        (await status.resumeBridge());
        (await status.getStatusBridge()).toNumber().should.be.equal(0); 
    });

    it("status  stopped, active => stopped", async () => {
        (await status.stopBridge());
        (await status.getStatusBridge()).toNumber().should.be.equal(2); 
    });

    it("status  stopped, active => paused by volume", async () => {
        (await status.pauseBridgeByVolume());
        (await status.getStatusBridge()).toNumber().should.be.equal(3); 
    });
});