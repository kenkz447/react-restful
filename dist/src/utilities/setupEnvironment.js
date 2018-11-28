"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fetcher_1 = require("./Fetcher");
const ResourceType_1 = require("./ResourceType");
exports.storeSymbol = Symbol();
exports.fetcherSymbol = Symbol();
exports.setupEnvironment = (options) => {
    const { store } = options;
    ResourceType_1.ResourceType.unRegisterTypes.map(o => store.registerResourceType(o));
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
