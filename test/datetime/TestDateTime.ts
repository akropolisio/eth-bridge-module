import { TestDateTimeInstance } from "../../types/truffle-contracts/index";
import EVMRevert from "../helpers/EVMRevert";
import { BigNumber } from 'bignumber.js';

// tslint:disable-next-line:no-var-requires
const { BN, constants, expectEvent, shouldFail } = require("@openzeppelin/test-helpers");

// tslint:disable-next-line:no-var-requires
require("chai").use(require("chai-as-promised")).should();

// tslint:disable-next-line:variable-name
const testDateTimeMock = artifacts.require("TestDateTime");

contract("---------- Test isLeapYear ---------- BokkyPooBahsDateTimeContract", async ([_, owner, wallet1, wallet2, wallet3, wallet4, wallet5]) => {
    let testDateTime: TestDateTimeInstance;

    beforeEach(async () =>  {
        testDateTime = await testDateTimeMock.new();    
    });

    it("(2000, 5, 24, 1, 2, 3) is a leap year", async () => {
        const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 5, 24, 1, 2, 3);
        (await testDateTime.isLeapYear(timestamp)).should.be.true;
    });

    it("(2100, 5, 24, 1, 2, 3) is a leap year", async () => {
      const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2100, 5, 24, 1, 2, 3);
      (await testDateTime.isLeapYear(timestamp)).should.be.false;
    });
  
    it("(2104, 5, 24, 1, 2, 3) is a leap year", async () => {
      const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2104, 5, 24, 1, 2, 3);
      (await testDateTime.isLeapYear(timestamp)).should.be.true;
    });
});

contract("---------- Test isValidDate and isValidDateTime ---------- BokkyPooBahsDateTimeContract", async ([_, owner, wallet1, wallet2, wallet3, wallet4, wallet5]) => {
    let testDateTime: TestDateTimeInstance;

    beforeEach(async () => {
      testDateTime = await testDateTimeMock.new();    
    });

    it("testDateTime.isValidDate(1969, 1, 1) is false", async () => {
      (await testDateTime.isValidDate(1969, 1, 1)).should.be.false;
    });

    it("testDateTime.isValidDate(1970, 1, 1) is true", async () => {
      (await testDateTime.isValidDate(1970, 1, 1)).should.be.true;
    });
  
    it("testDateTime.isValidDate(2000, 2, 29) is true", async () => {
      (await testDateTime.isValidDate(2000, 2, 29)).should.be.true;
    });
  
    it("testDateTime.isValidDate(2001, 2, 29) is false", async () => {
      (await testDateTime.isValidDate(2001, 2, 29)).should.be.false;
    });
  
    it("testDateTime.isValidDate(2001, 0, 1) is false", async () => {
      (await testDateTime.isValidDate(2001, 0, 1)).should.be.false;
    });
  
    it("testDateTime.isValidDate(2001, 1, 0) is false", async () => {
      (await testDateTime.isValidDate(2001, 1, 0)).should.be.false;
    });
    
    it("testDateTime.isValidDateTime(2000, 2, 29, 0, 0, 0) is true", async () => {
      (await testDateTime.isValidDateTime(2000, 2, 29, 0, 0, 0)).should.be.true;
    });

    it("testDateTime.isValidDateTime(2000, 2, 29, 1, 1, 1) is true", async () => {
      (await testDateTime.isValidDateTime(2000, 2, 29, 1, 1, 1)).should.be.true;
    });
  
    it("testDateTime.isValidDateTime(2000, 2, 29, 23, 1, 1) is true", async () => {
      (await testDateTime.isValidDateTime(2000, 2, 29, 23, 1, 1)).should.be.true;
    });
  
    it("testDateTime.isValidDateTime(2000, 2, 29, 24, 1, 1) is false", async () => {
      (await testDateTime.isValidDateTime(2000, 2, 29, 24, 1, 1)).should.be.false;
    });
  
    it("testDateTime.isValidDateTime(2000, 2, 29, 1, 59, 1) is true", async () => {
      (await testDateTime.isValidDateTime(2000, 2, 29, 1, 59, 1)).should.be.true;
    });
  
    it("testDateTime.isValidDateTime(2000, 2, 29, 1, 60, 1) is false", async () => {
      (await testDateTime.isValidDateTime(2000, 2, 29, 1, 60, 1)).should.be.false;
    });
  
    it("testDateTime.isValidDateTime(2000, 2, 29, 1, 1, 59) is true", async () => {
      (await testDateTime.isValidDateTime(2000, 2, 29, 1, 1, 59)).should.be.true;
    });
  
    it("testDateTime.isValidDateTime(2000, 2, 29, 1, 1, 60) is false", async () => {
      (await testDateTime.isValidDateTime(2000, 2, 29, 1, 1, 60)).should.be.false;
    });
});

contract("---------- Test _isLeapYear ---------- BokkyPooBahsDateTimeContract", async ([_, owner, wallet1, wallet2, wallet3, wallet4, wallet5]) => {
  let testDateTime: TestDateTimeInstance;

  beforeEach(async () => {
    testDateTime = await testDateTimeMock.new();
  });

  it("2000 is a leap year", async () => {
      
      (await testDateTime._isLeapYear(2000)).should.be.true;
  });

  it("2100 is a not leap year", async () => {
    
    (await testDateTime._isLeapYear(2100)).should.be.false;
  });
  
  it("2104 is a leap year", async () => {
    
    (await testDateTime._isLeapYear(2104)).should.be.true;
  });

});

contract("---------- Test _isLeapYear ---------- BokkyPooBahsDateTimeContract", async ([_, owner, wallet1, wallet2, wallet3, wallet4, wallet5]) => {
  let testDateTime: TestDateTimeInstance;

  beforeEach(async () => {
    testDateTime = await testDateTimeMock.new();
  });

  it("2000 is a leap year", async () => {
      
      (await testDateTime._isLeapYear(2000)).should.be.true;
  });

  it("2100 is a not leap year", async () => {
    
    (await testDateTime._isLeapYear(2100)).should.be.false;
  });
  
  it("2104 is a leap year", async () => {
    
    (await testDateTime._isLeapYear(2104)).should.be.true;
  });

});

contract("---------- Test isWeekDay ---------- BokkyPooBahsDateTimeContract", async ([_, owner, wallet1, wallet2, wallet3, wallet4, wallet5]) => {
  let testDateTime: TestDateTimeInstance;

  beforeEach(async () => {
    testDateTime = await testDateTimeMock.new();
  });

  it("(2018, 5, 24, 1, 2, 3) is a week day", async () => {
      const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 5, 24, 1, 2, 3);
      (await testDateTime.isWeekDay(timestamp)).should.be.true;
  });

  it("(2018, 5, 25, 1, 2, 3) is a week day", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 5, 25, 1, 2, 3);
    (await testDateTime.isWeekDay(timestamp)).should.be.true;
  });
  
  it("(2018, 5, 26, 1, 2, 3) is a not week day", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 5, 26, 1, 2, 3);
    (await testDateTime.isWeekDay(timestamp)).should.be.false;
  });
});

contract("---------- Test isWeekEnd ---------- BokkyPooBahsDateTimeContract", async ([_, owner, wallet1, wallet2, wallet3, wallet4, wallet5]) => {
  let testDateTime: TestDateTimeInstance;

  beforeEach(async () => {
    testDateTime = await testDateTimeMock.new();
  });

  it("(2018, 5, 24, 1, 2, 3) is a not a week end", async () => {
      const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 5, 24, 1, 2, 3);
      (await testDateTime.isWeekEnd(timestamp)).should.be.false;
  });

  it("(2018, 5, 25, 1, 2, 3) is a not a week end", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 5, 25, 1, 2, 3);
    (await testDateTime.isWeekEnd(timestamp)).should.be.false;
  });
  
  it("(2018, 5, 26, 1, 2, 3) is a week end", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 5, 26, 1, 2, 3);
    (await testDateTime.isWeekEnd(timestamp)).should.be.true;
  });

  it("(2018, 5, 27, 1, 2, 3) is a week end", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 5, 27, 1, 2, 3);
    (await testDateTime.isWeekEnd(timestamp)).should.be.true;
  });
});

contract("---------- Test getDaysInMonth ---------- BokkyPooBahsDateTimeContract", async ([_, owner, wallet1, wallet2, wallet3, wallet4, wallet5]) => {
  let testDateTime: TestDateTimeInstance;

  beforeEach(async () => {
    testDateTime = await testDateTimeMock.new();
  });

  it("(2000, 1, 24, 1, 2, 3) has 31 days", async () => {
      const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 1, 24, 1, 2, 3);
      (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(31);
  });

  it("(2000, 2, 24, 1, 2, 3) has 29 days", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 2, 24, 1, 2, 3);
    (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(29);
  });
  
  it("(2001, 2, 24, 1, 2, 3) has 28 days", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2001, 2, 24, 1, 2, 3);
    (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(28);
  });

  it("(2000, 3, 24, 1, 2, 3) has 31 days", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 3, 24, 1, 2, 3);
    (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(31);
  });

  it("(2000, 4, 24, 1, 2, 3) has 30 days", async () => {
      const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 4, 24, 1, 2, 3);
      (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(30);
  });

  it("(2000, 5, 24, 1, 2, 3) has 31 days", async () => {
      const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 5, 24, 1, 2, 3);
      (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(31);
  });
  
  it("(2000, 6, 24, 1, 2, 3) has 30 days", async () => {
      const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 6, 24, 1, 2, 3);
      (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(30);
  });

  it("(2000, 7, 24, 1, 2, 3) has 31 days", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 7, 24, 1, 2, 3);
    (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(31);
  });

  it("(2000, 8, 24, 1, 2, 3) has 31 days", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 8, 24, 1, 2, 3);
    (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(31);
  });

  it("(2000, 9, 24, 1, 2, 3) has 30 days", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 9, 24, 1, 2, 3);
    (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(30);
  });

  it("(2000, 10, 24, 1, 2, 3) has 31 days", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 10, 24, 1, 2, 3);
    (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(31);
  });

  it("(2000, 11, 24, 1, 2, 3) has 30 days", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 11, 24, 1, 2, 3);
    (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(30);
  });

  it("(2000, 12, 24, 1, 2, 3) has 31 days", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 12, 24, 1, 2, 3);
    (await testDateTime.getDaysInMonth(timestamp)).toNumber().should.equal(31);
  });
});
