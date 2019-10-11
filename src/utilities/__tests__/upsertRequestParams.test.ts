
import { upsertRequestParams } from '../upsertRequestParams';
import { RequestParams } from '../../core';

describe('Utilities', () => {
    describe('upsertRequestParams', () => {
        it('should return empty array if input params is null or undefine', () => {
            let params = upsertRequestParams(undefined!, 'query', 'p2', '');
            expect(params).toEqual([]);
        });
        it('should update existing param', () => {
            const params: RequestParams = [{
                type: 'query',
                parameter: 'p1',
                value: 'p1'
            }, {
                type: 'query',
                parameter: 'p2',
                value: 'p2'
            }];

            const nextP2Value = 'p2 updated';
            let nextParams = upsertRequestParams(params, 'query', 'p2', nextP2Value);

            expect(nextParams).toEqual([{
                type: 'query',
                parameter: 'p1',
                value: 'p1'
            }, {
                type: 'query',
                parameter: 'p2',
                value: nextP2Value
            }]);
        });

        it('should insert new param', () => {
            const initParams: RequestParams = [{
                type: 'query',
                parameter: 'p1',
                value: 'p1'
            }];

            const newParam: RequestParams = {
                type: 'query',
                parameter: 'p3',
                value: 'p3'
            };

            const nextParams = upsertRequestParams(
                initParams,
                newParam.type,
                newParam.parameter as string,
                newParam.value
            );

            expect(nextParams).toEqual([
                ...initParams,
                newParam
            ]);
        });

        it('should delete param when value is undefined', () => {
            const params: RequestParams = [{
                type: 'query',
                parameter: 'p1',
                value: 'p1'
            }];

            const nextParams = upsertRequestParams(params, 'query', 'p1', undefined);
            expect(nextParams).toEqual([]);
        });
    });
});