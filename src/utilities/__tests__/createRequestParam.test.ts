
import { createRequestParam } from '../createRequestParam';

describe('upsertRequestParams', () => {
    it('show work correctly', () => {
        const pathPrams = createRequestParam(1, 'path', 'id');
        const queryParam = createRequestParam(false, 'query', 'isDisable');
        const bodyParams = createRequestParam({}, 'body');

        expect(pathPrams).toEqual({
            type: 'path',
            parameter: 'id',
            value: 1
        });

        expect(queryParam).toEqual({
            type: 'query',
            parameter: 'isDisable',
            value: false
        });

        expect(bodyParams).toEqual({
            type: 'body',
            value: {}
        });
    });
});