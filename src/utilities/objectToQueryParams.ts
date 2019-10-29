import { RequestParameter } from '../core';

export const objectToQueryParams = (obj: object): RequestParameter[] => {
    if (!obj) {
        return [];
    }

    const objKeys = Object.keys(obj);
    const parms: RequestParameter[] = [];
    for (const key of objKeys) {
        parms.push({
            parameter: key,
            type: 'query',
            value: obj[key]
        });
    }

    return parms;
};