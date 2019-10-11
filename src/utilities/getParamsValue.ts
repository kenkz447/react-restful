import { RequestParams, RequestParameter } from '../core';

export const getParamsValue = (
    params: RequestParams,
    type: RequestParameter['type'],
    parameter?: string
) => {
    if (!params) {
        return null;
    }

    if (Array.isArray(params)) {
        const param = params.filter(o => o.parameter === parameter && o.type === type);

        if (!param.length) {
            return;
        }

        if (param.length > 1) {
            return param.map(o => o.value);
        }

        return param[0].value;
    }

    return params.value;
};