"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fetcher_1 = require("./Fetcher");
const Store_1 = require("./Store");
exports.storeSymbol = Symbol();
exports.fetcherSymbol = Symbol();
/**
 * Quick setup for react-restful
 * @param {FetcherProps} options
 */
exports.setupEnvironment = (options) => {
    const store = new Store_1.Store();
    const fetcher = new Fetcher_1.Fetcher(Object.assign({ store: store }, options));
    if (global) {
        global[exports.storeSymbol] = store;
        global[exports.fetcherSymbol] = fetcher;
    }
    return {
        store: store,
        request: fetcher.fetchResource,
        option: options
    };
};
