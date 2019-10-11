
import { createRequestParam } from '../createRequestParam';
import { RequestParams } from '../../core';
import { getParamsValue } from '../getParamsValue';

describe('getParamsValue', () => {
    it('show work correctly', () => {
        const params: RequestParams = [
            createRequestParam('1', 'path', 'id'),
            createRequestParam(1, 'query', 'parameters'),
            createRequestParam(2, 'query', 'parameters'),
            createRequestParam(3, 'query', 'parameters'),
            createRequestParam({}, 'body')
        ];

        const pathValue = getParamsValue(params, 'path', 'id');
        const queryValue = getParamsValue(params, 'query', 'parameters');
        const bodyvalue = getParamsValue(params, 'body');

        expect(pathValue).toEqual('1');

        expect(queryValue).toEqual([1, 2, 3]);

        expect(bodyvalue).toEqual({});
    });

    it('nothing will be returned', () => {
        const params = undefined;
        const pathValue = getParamsValue(params!, 'path', 'id');
        const queryValue = getParamsValue([], 'query', 'parameters');

        expect(pathValue).toEqual(undefined);
        expect(queryValue).toEqual(undefined);
    });
});