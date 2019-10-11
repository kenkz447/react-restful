"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParamsValue = function (params, type, parameter) {
    if (!params) {
        return null;
    }
    if (Array.isArray(params)) {
        var param = params.filter(function (o) { return o.parameter === parameter && o.type === type; });
        if (!param.length) {
            return;
        }
        if (param.length > 1) {
            return param.map(function (o) { return o.value; });
        }
        return param[0].value;
    }
    return params.value;
};
