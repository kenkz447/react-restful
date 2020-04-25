"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("../core");
var react_1 = require("react");
exports.useResource = function (resource, params, meta) {
    var _a = __read(react_1.useState(false), 2), isLoading = _a[0], setLoading = _a[1];
    var _b = __read(react_1.useState(), 2), error = _b[0], setError = _b[1];
    var _c = __read(react_1.useState(), 2), data = _c[0], setData = _c[1];
    var fetcher = global[core_1.fetcherSymbol];
    var sendRequest = function () {
        setLoading(true);
        fetcher.fetchResource(resource, params, meta)
            .then(setData)
            .catch(setError)
            .finally(function () { return setLoading(false); });
    };
    return {
        isLoading: isLoading,
        error: error,
        data: data,
        sendRequest: sendRequest
    };
};
