"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectToQueryParams = function (obj) {
    var e_1, _a;
    if (!obj) {
        return [];
    }
    var objKeys = Object.keys(obj);
    var parms = [];
    try {
        for (var objKeys_1 = __values(objKeys), objKeys_1_1 = objKeys_1.next(); !objKeys_1_1.done; objKeys_1_1 = objKeys_1.next()) {
            var key = objKeys_1_1.value;
            parms.push({
                parameter: key,
                type: 'query',
                value: obj[key]
            });
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (objKeys_1_1 && !objKeys_1_1.done && (_a = objKeys_1.return)) _a.call(objKeys_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return parms;
};
