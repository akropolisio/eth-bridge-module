import {CandidateInstance, CandidateContract } from "../../types/truffle-contracts/index";
import EVMRevert from "../helpers/EVMRevert";
import { formatBytes32String } from "ethers/utils";


// tslint:disable-next-line:no-var-requires
const { BN, constants, expectEvent, shouldFail } = require("@openzeppelin/test-helpers");

// tslint:disable-next-line:no-var-requires
require("chai").use(require("chai-as-promised")).should();

const Candidate = artifacts.require("Candidate");

contract("Candidate", async ([_, owner,  wallet1, wallet2, wallet3, wallet4, wallet5]) => {

    let candi: CandidateInstance;

    beforeEach(async function() {
       candi = await Candidate.new();  
       candi.initialize(); 
    });

    it("add candidate => ", async () => {
        await candi.addCandidate("0x6a8357ae0173737209af59152ee30a786dbade70", web3.utils.asciiToHex("32"));
        (await candi.isCandidateExists("0x6a8357ae0173737209af59152ee30a786dbade70")).should.be.equal(true);
    });
});