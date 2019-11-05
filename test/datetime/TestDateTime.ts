import { BigNumber } from "bignumber.js";
import { TestDateTimeInstance } from "../../types/truffle-contracts/index";
import EVMRevert from "../helpers/EVMRevert";

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

contract("---------- Test _getDaysInMonth ---------- BokkyPooBahsDateTimeContract", async ([_, owner, wallet1, wallet2, wallet3, wallet4, wallet5]) => {
  let testDateTime: TestDateTimeInstance;

  beforeEach(async () => {
    testDateTime = await testDateTimeMock.new();
  });

  it("2000/01 has 31 days", async () => {
    (await testDateTime._getDaysInMonth(2000, 1)).toNumber().should.equal(31);
  });

  it("2000/02 has 29 days", async () => {
    (await testDateTime._getDaysInMonth(2000, 2)).toNumber().should.equal(29);
  });

  it("2001/02 has 28 days", async () => {
    (await testDateTime._getDaysInMonth(2001, 2)).toNumber().should.equal(28);
  });

  it("2000/03 has 31 days", async () => {
    (await testDateTime._getDaysInMonth(2000, 3)).toNumber().should.equal(31);
  });

  it("2000/04 has 30 days", async () => {
    (await testDateTime._getDaysInMonth(2000, 4)).toNumber().should.equal(30);
  });

  it("2000/05 has 31 days", async () => {
    (await testDateTime._getDaysInMonth(2000, 5)).toNumber().should.equal(31);
  });

  it("2000/06 has 30 days", async () => {
    (await testDateTime._getDaysInMonth(2000, 6)).toNumber().should.equal(30);
  });

  it("2000/07 has 31 day", async () => {
    (await testDateTime._getDaysInMonth(2000, 7)).toNumber().should.equal(31);
  });

  it("2000/08 has 31 days", async () => {
    (await testDateTime._getDaysInMonth(2000, 8)).toNumber().should.equal(31);
  });

  it("2000/09 has 30 days", async () => {
    (await testDateTime._getDaysInMonth(2000, 9)).toNumber().should.equal(30);
  });

  it("2000/10 has 31 days", async () => {
    (await testDateTime._getDaysInMonth(2000, 10)).toNumber().should.equal(31);
  });

  it("2000/11 has 30 days", async () => {
    (await testDateTime._getDaysInMonth(2000, 11)).toNumber().should.equal(30);
  });

  it("2000/12 has 31 days", async () => {
    (await testDateTime._getDaysInMonth(2000, 12)).toNumber().should.equal(31);
  });

});

contract("--------- Test getDayOfWeek ---------- BokkyPooBahsDateTimeContract", async ([_, owner, wallet1, wallet2, wallet3, wallet4, wallet5]) => {
  let testDateTime: TestDateTimeInstance;

  beforeEach(async () => {
    testDateTime = await testDateTimeMock.new();
  });
   
  it("(2018, 5, 21, 1, 2, 3) is 1 Monday", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 5, 21, 1, 2, 3);
    (await testDateTime.getDayOfWeek(timestamp)).toNumber().should.equal(1);
  });

  it("(2018, 5, 24, 1, 2, 3) is 4 Thursday", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 5, 24, 1, 2, 3);
    (await testDateTime.getDayOfWeek(timestamp)).toNumber().should.equal(4);
  });

  it("(2018, 5, 26, 1, 2, 3) is 6 Saturday", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 5, 26, 1, 2, 3);
    (await testDateTime.getDayOfWeek(timestamp)).toNumber().should.equal(6);
  });

  it("(2018, 5, 27, 1, 2, 3) is 7 Sunday", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 5, 27, 1, 2, 3);
    (await testDateTime.getDayOfWeek(timestamp)).toNumber().should.equal(7);
  });

});

contract("---------- Test get* ---------- BokkyPooBahsDateTimeContract", async ([_, owner, wallet1, wallet2, wallet3, wallet4, wallet5]) => {
  let testDateTime: TestDateTimeInstance;
  let timestamp: BigNumber
  beforeEach(async () => {
    testDateTime = await testDateTimeMock.new();
    timestamp = await testDateTime.timestampFromDateTime(2018, 5, 21, 1, 2, 3);
  });
   
  it("(2018, 5, 21, 1, 2, 3)  - year is 2018", async () => {
    
    (await testDateTime.getYear(timestamp)).toNumber().should.equal(2018);
  });

  it("(2018, 5, 21, 1, 2, 3)  - month is 5 May", async () => {
    (await testDateTime.getMonth(timestamp)).toNumber().should.equal(5);
  });

  it("(2018, 5, 21, 1, 2, 3)  - day is 21", async () => {
    (await testDateTime.getDay(timestamp)).toNumber().should.equal(21);
  });

  it("(2018, 5, 21, 1, 2, 3)  - hour is 1", async () => {
    
    (await testDateTime.getHour(timestamp)).toNumber().should.equal(1);
  });

  it("(2018, 5, 21, 1, 2, 3)  - minute is 2", async () => {
    
    (await testDateTime.getMinute(timestamp)).toNumber().should.equal(2);
  });

  it("(2018, 5, 21, 1, 2, 3)  - second is 3", async () => {
    
    (await testDateTime.getSecond(timestamp)).toNumber().should.equal(3);
  });
});

contract("---------- Test add{Years|Months|Days|Hours|Minutes|Seconds} ---------- BokkyPooBahsDateTimeContract", async ([_, owner, wallet1, wallet2, wallet3, wallet4, wallet5]) => {
  let testDateTime: TestDateTimeInstance;
  
  beforeEach(async () => {
    testDateTime = await testDateTimeMock.new();
    
  });

  it("(2000, 2, 29, 1, 2, 3) + 3 years is 2003/02/28 01:02:03", async () => {
    const timestamp: BigNumber = (await testDateTime.timestampFromDateTime(2000, 2, 29, 1, 2, 3));
    const newTimestamp: BigNumber = await testDateTime.addYears(timestamp, 3);
    const expectedTimestamp: BigNumber = await testDateTime.timestampFromDateTime(2003, 2, 28, 1, 2, 3);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2003, 2, 28, 1, 2, 3) + 30 years is 2048/12/31 02:03:04", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 12, 31, 2, 3, 4);
    const newTimestamp: BigNumber = await testDateTime.addYears(timestamp, 30);
    const expectedTimestamp: BigNumber = await testDateTime.timestampFromDateTime(2048, 12, 31, 2, 3, 4);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2018, 5, 27, 1, 2, 3) + 37 months is 2003/02/28 01:02:03", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 1, 31, 1, 2, 3);
    const newTimestamp: BigNumber = await testDateTime.addMonths(timestamp, 37);
    const expectedTimestamp: BigNumber = await testDateTime.timestampFromDateTime(2003, 2, 28, 1, 2, 3);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2018, 5, 27, 1, 2, 3) + 362 months is 2049/02/01 02:03:04", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 12, 1, 2, 3, 4);
    const newTimestamp: BigNumber = await testDateTime.addMonths(timestamp, 362);
    const expectedTimestamp: BigNumber = await testDateTime.timestampFromDateTime(2049, 2, 1, 2, 3, 4);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2018, 12, 31, 2, 3, 4) + 37,532 days is 2119/11/05 01:02:03", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2017, 1, 31, 1, 2, 3);
    const newTimestamp: BigNumber = await testDateTime.addDays(timestamp, 37532);
    const expectedTimestamp: BigNumber = await testDateTime.timestampFromDateTime(2119, 11, 5, 1, 2, 3);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2000, 1, 31, 1, 2, 3) + 900,768 hours is 2119/11/05 01:02:03", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2017, 1, 31, 1, 2, 3);
    const newTimestamp: BigNumber = await testDateTime.addHours(timestamp, 900768);
    const expectedTimestamp: BigNumber = await testDateTime.timestampFromDateTime(2119, 11, 5, 1, 2, 3);
    
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2018, 12, 1, 2, 3, 4) + 781,920 minutes is 2018/07/28 01:02:03", async () => {
    const timestamp = await testDateTime.timestampFromDateTime(2017, 1, 31, 1, 2, 3);
    const newTimestamp = await testDateTime.addMinutes(timestamp, 781920);
    const expectedTimestamp = await testDateTime.timestampFromDateTime(2018, 7, 28, 1, 2, 3);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2017, 1, 31, 1, 2, 3) + 461,548,800 seconds is 2031/09/17 01:02:03", async () => {
    const timestamp = await testDateTime.timestampFromDateTime(2017, 1, 31, 1, 2, 3);
    const newTimestamp = await testDateTime.addSeconds(timestamp, "461548800");
    const expectedTimestamp = await testDateTime.timestampFromDateTime(2031, 9, 17, 1, 2, 3);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });
});

contract("---------- Test sub{Years|Months|Days|Hours|Minutes|Seconds} ---------- BokkyPooBahsDateTimeContract", async ([_, owner, wallet1, wallet2, wallet3, wallet4, wallet5]) => {
  let testDateTime: TestDateTimeInstance;
  
  beforeEach(async () => {
    testDateTime = await testDateTimeMock.new();
    
  });

  it("(2000, 2, 29, 1, 2, 3) - 3 years is 1997/02/28 01:02:03", async () => {
    const timestamp: BigNumber = (await testDateTime.timestampFromDateTime(2000, 2, 29, 1, 2, 3));
    const newTimestamp: BigNumber = await testDateTime.subYears(timestamp, 3);
    const expectedTimestamp: BigNumber = await testDateTime.timestampFromDateTime(1997, 2, 28, 1, 2, 3);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2000, 2, 29, 1, 2, 3) - 37 months is 1997/01/29 01:02:03", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2000, 2, 29, 1, 2, 3);
    const newTimestamp: BigNumber = await testDateTime.subMonths(timestamp, 37);
    const expectedTimestamp: BigNumber = await testDateTime.timestampFromDateTime(1997, 1, 29, 1, 2, 3);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2013, 1, 1, 1, 2, 3) - 3,756 days is 2002/09/20 01:02:03", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2013, 1, 1, 1, 2, 3);
    const newTimestamp: BigNumber = await testDateTime.subDays(timestamp, 3756);
    const expectedTimestamp: BigNumber = await testDateTime.timestampFromDateTime(2002, 9, 20, 1, 2, 3);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2013, 1, 1, 1, 2, 3) - 3,756 * 24 hours is 2002/09/20 01:02:03", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2013, 1, 1, 1, 2, 3);
    const newTimestamp: BigNumber = await testDateTime.subHours(timestamp, 3756 * 24);
    const expectedTimestamp: BigNumber = await testDateTime.timestampFromDateTime(2002, 9, 20, 1, 2, 3);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2015, 7, 15, 1, 2, 3) - 223,776 hours is 1990/01/03 01:02:03", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2015, 7, 15, 1, 2, 3);
    const newTimestamp: BigNumber = await testDateTime.subHours(timestamp, "223776");
    const expectedTimestamp: BigNumber = await testDateTime.timestampFromDateTime(1990, 1, 3, 1, 2, 3);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2018, 3, 1, 2, 3, 4) - 21,600,000 minutes is 1977/02/04 02:03:04", async () => {
    const timestamp: BigNumber = await testDateTime.timestampFromDateTime(2018, 3, 1, 2, 3, 4);
    const newTimestamp: BigNumber = await testDateTime.subMinutes(timestamp, "21600000");
    const expectedTimestamp: BigNumber = await testDateTime.timestampFromDateTime(1977, 2, 4, 2, 3, 4);
    
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2018, 3, 1, 2, 3, 4) - 21,600,000 minutes is 1977/02/04 02:03:04", async () => {
    const timestamp = await testDateTime.timestampFromDateTime(2018, 3, 1, 2, 3, 4);
    const newTimestamp = await testDateTime.subMinutes(timestamp, "21600000");
    const expectedTimestamp = await testDateTime.timestampFromDateTime(1977, 2, 4, 2, 3, 4);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });

  it("(2020, 3, 19, 3, 4, 5) - 788,227,200 seconds is 1995/03/28 03:04:05", async () => {
    const timestamp = await testDateTime.timestampFromDateTime(2020, 3, 19, 3, 4, 5);
    const newTimestamp = await testDateTime.subSeconds(timestamp, "788227200");
    const expectedTimestamp = await testDateTime.timestampFromDateTime(1995, 3, 28, 3, 4, 5);
    newTimestamp.should.bignumber.equal(expectedTimestamp);
  });
});
