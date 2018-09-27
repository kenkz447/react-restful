"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fetcher_1 = require("./Fetcher");
const Store_1 = require("./Store");
exports.storeSymbol = Symbol();
exports.fetcherSymbol = Symbol();
exports.getStore = () => window[exports.storeSymbol];
exports.setupEnvironment = (fetcherProps) => {
    const store = new Store_1.Store();
    const fetcher = new Fetcher_1.Fetcher(Object.assign({ store: store }, fetcherProps));
    exports.request = fetcher.fetchResource;
    if (window) {
        window[exports.storeSymbol] = store;
        window[exports.fetcherSymbol] = fetcher;
    }
};
