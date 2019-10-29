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
var objectToQueryParams_1 = require("./objectToQueryParams");
var getParamsAsObject = function (url) {
    var e_1, _a;
    url = url.substring(url.indexOf('?') + 1);
    var re = /([^&=]+)=?([^&]*)/g;
    var decodeRE = /\+/g;
    var decode = function (str) {
        return decodeURIComponent(str.replace(decodeRE, ' '));
    };
    var params = {}, e;
    while (e = re.exec(url)) {
        var k = decode(e[1]), v = decode(e[2]);
        if (k.substring(k.length - 2) === '[]') {
            k = k.substring(0, k.length - 2);
            (params[k] || (params[k] = [])).push(v);
        }
        else {
            params[k] = v;
        }
    }
    var assign = function (obj, keyPath, value) {
        var lastKeyIndex = keyPath.length - 1;
        for (var i = 0; i < lastKeyIndex; ++i) {
            var key = keyPath[i];
            if (!(key in obj)) {
                obj[key] = {};
            }
            obj = obj[key];
        }
        obj[keyPath[lastKeyIndex]] = value;
    };
    var paramsKeys = Object.keys(params);
    var _loop_1 = function (prop) {
        structure = prop.split('[');
        if (structure.length > 1) {
            var levels_1 = [];
            structure.forEach(function (item, i) {
                var key = item.replace(/[?[\]\\ ]/g, '');
                levels_1.push(key);
            });
            assign(params, levels_1, params[prop]);
            delete (params[prop]);
        }
    };
    var structure;
    try {
        for (var paramsKeys_1 = __values(paramsKeys), paramsKeys_1_1 = paramsKeys_1.next(); !paramsKeys_1_1.done; paramsKeys_1_1 = paramsKeys_1.next()) {
            var prop = paramsKeys_1_1.value;
            _loop_1(prop);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (paramsKeys_1_1 && !paramsKeys_1_1.done && (_a = paramsKeys_1.return)) _a.call(paramsKeys_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return params;
};
exports.urlToQueryParams = function (url) {
    var obj = getParamsAsObject(url);
    return objectToQueryParams_1.objectToQueryParams(obj);
};
