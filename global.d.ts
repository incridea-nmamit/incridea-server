/* eslint-disable no-var */
declare global {
  /**
   * this is to force tsc to warn usage of __filename and __dirname
   * as they are not available in es modules
   * */
  var __filename: undefined;
  var __dirname: undefined;
}

export {};
