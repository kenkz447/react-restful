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
exports.upsertRequestParams = function (params, type, parameter, value) {
    if (!params) {
        return [];
    }
    if (value === undefined) {
        return params.filter(function (o) { return type + "_" + o.parameter !== type + "_" + parameter; });
    }
    var nextParams = params.map(function (param) {
        if (param.type === type && param.parameter === parameter) {
            return __assign({}, param, { value: value });
        }
        return param;
    });
    var isParamExist = params.find(function (o) { return o.parameter === parameter; });
    if (!isParamExist) {
        nextParams.push({
            type: type,
            parameter: parameter,
            value: value
        });
    }
    return nextParams;
};
exports.getParamsValue = function (params, type, parameter) {
    if (!params) {
        return null;
    }
    if (Array.isArray(params)) {
        var param = params.find(function (o) { return o.parameter === parameter && o.type === type; });
        return param ? param.value : null;
    }
    return params.value;
};
