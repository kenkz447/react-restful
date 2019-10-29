import { objectToQueryParams } from '../objectToQueryParams';

describe('objectToQueryParams', () => {
    it('should work correctly with a object', () => {
        const params = objectToQueryParams({
            foo: 'foo',
            bar: 'bar'
        });

        expect(params).toEqual([
            {
                parameter: 'foo',
                type: 'query',
                value: 'foo'
            },
            {
                parameter: 'bar',
                type: 'query',
                value: 'bar'
            }
        ]);
    });

    it('should return empty array with invalid object', () => {
        const params = objectToQueryParams(null!);

        expect(params).toEqual([]);
    });
});