"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Fetcher_1 = require("./Fetcher");
var ResourceType_1 = require("./ResourceType");
exports.storeSymbol = 'Symbol' in global ? Symbol() : 'REACT_RESTFUL_STORE';
exports.fetcherSymbol = 'Symbol' in global ? Symbol() : 'REACT_RESTFUL_FETCHER';
exports.setupEnvironment = function (options) {
    var store = options.store;
    ResourceType_1.ResourceType.unRegisterTypes.map(function (o) { return store.registerResourceType(o); });
    var fetcher = new Fetcher_1.Fetcher(__assign({ store: store }, options));
    if (global) {
        global[exports.storeSymbol] = store;
        global[exports.fetcherSymbol] = fetcher;
    }
    return {
        store: store,
        request: fetcher.fetchResource
    };
};
