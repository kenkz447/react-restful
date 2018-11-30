"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertRequestParams = (params, type, parameter, value) => {
    if (!params) {
        return [];
    }
    if (value === undefined) {
        return params.filter(o => o.type !== type && o.parameter !== parameter);
    }
    const nextParams = params.map(param => {
        if (param.type === type && param.parameter === parameter) {
            return Object.assign({}, param, { value: value });
        }
        return param;
    });
    const isParamExist = params.find(o => o.parameter === parameter);
    if (!isParamExist) {
        nextParams.push({
            type: type,
            parameter: parameter,
            value: value
        });
    }
    return nextParams;
};
exports.getParamsValue = (params, type, parameter) => {
    if (!params) {
        return null;
    }
    if (Array.isArray(params)) {
        return params.find(o => o.parameter === parameter && o.type === type) || null;
    }
    return params.value;
};
