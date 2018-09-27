"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fetcher_1 = require("./Fetcher");
const Store_1 = require("./Store");
exports.storeSymbol = Symbol();
exports.fetcherSymbol = Symbol();
exports.getStore = () => global[exports.storeSymbol];
exports.setupEnvironment = (fetcherProps) => {
    const store = new Store_1.Store();
    const fetcher = new Fetcher_1.Fetcher(Object.assign({ store: store }, fetcherProps));
    exports.request = fetcher.fetchResource;
    if (global) {
        global[exports.storeSymbol] = store;
        global[exports.fetcherSymbol] = fetcher;
    }
};
