import { RequestParameter } from '../core';

export const upsertRequestParams = (
    params: RequestParameter[],
    type: RequestParameter['type'],
    parameter: string,
    value: unknown
) => {
    if (!params) {
        return [];
    }

    if (value === undefined) {
        return params.filter(o => `${type}_${o.parameter}` !== `${type}_${parameter}`);
    }

    const nextParams = params.map(param => {
        if (param.type === type && param.parameter === parameter) {
            return {
                ...param,
                value: value
            };
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

    return nextParams as RequestParameter[];
};
