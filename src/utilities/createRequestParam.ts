import { RequestParameter } from '../core';

export const createRequestParam = (
    value: RequestParameter['value'],
    type: RequestParameter['type'],
    parameter?: RequestParameter['parameter'],
): RequestParameter => {

    if (type === 'body') {
        return {
            type: 'body',
            value: value
        };
    }

    return {
        type,
        value,
        parameter
    };
};