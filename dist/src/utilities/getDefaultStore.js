"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("../core");
exports.getDefaultStore = function () {
    if (!global) {
        return null;
    }
    return global[core_1.storeSymbol];
};
