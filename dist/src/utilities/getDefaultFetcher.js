"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("../core");
exports.getDefaultFetcher = function () {
    if (!global) {
        return null;
    }
    return global[core_1.fetcherSymbol];
};
