"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fetcher_1 = require("./Fetcher");
exports.storeSymbol = Symbol();
exports.fetcherSymbol = Symbol();
exports.setupEnvironment = (options) => {
    const { store } = options;
    const fetcher = new Fetcher_1.Fetcher(Object.assign({ store: store }, options));
    if (global) {
        global[exports.storeSymbol] = store;
        global[exports.fetcherSymbol] = fetcher;
    }
    return {
        store: store,
        request: fetcher.fetchResource
    };
};
