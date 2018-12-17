import { RequestParams, RequestParameter } from './Fetcher';

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
        return params.filter(o => o.type !== type && o.parameter !== parameter);
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

export const getParamsValue = <T>(
    params: RequestParams,
    type: RequestParameter['type'],
    parameter?: string
): T | null => {
    if (!params) {
        return null;
    }

    if (Array.isArray(params)) {
        const param = params.find(o => o.parameter === parameter && o.type === type);
        return param ? param.value as T : null;
    }

    return params.value as T;
};