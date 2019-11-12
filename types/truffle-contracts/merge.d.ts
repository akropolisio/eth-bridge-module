/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

/// <reference types="truffle-typings" />

import * as TruffleContracts from ".";

declare global {
  namespace Truffle {
    interface Artifacts {
      require(name: "Bridge"): TruffleContracts.BridgeContract;
      require(name: "DAIBridge"): TruffleContracts.DAIBridgeContract;
      require(name: "Dao"): TruffleContracts.DaoContract;
      require(name: "IERC20"): TruffleContracts.IERC20Contract;
      require(name: "Limits"): TruffleContracts.LimitsContract;
      require(name: "Status"): TruffleContracts.StatusContract;
      require(name: "TestDateTime"): TruffleContracts.TestDateTimeContract;
      require(name: "Transfers"): TruffleContracts.TransfersContract;
      require(
        name: "ValidatorsOperations"
      ): TruffleContracts.ValidatorsOperationsContract;
      require(
        name: "ValidatorsOperationsMock"
      ): TruffleContracts.ValidatorsOperationsMockContract;
    }
  }
}
