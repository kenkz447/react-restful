import { Resource } from '../Resource';
import { User } from '../../test-resources';
import { RequestParameter } from '../Fetcher';

describe('Resource', () => {
    const createUserResource = new Resource<User>({
        method: 'POST',
        url: '/api/users/:branch'
    });

    const pathParam: RequestParameter = {
        type: 'path',
        parameter: 'branch',
        value: 1
    };

    const queryParam: RequestParameter = {
        type: 'query',
        parameter: 'page',
        value: 2
    };

    const bodyParams: RequestParameter = {
        type: 'body',
        value: { id: 1 }
    };

    describe('instance', () => {
        it('urlReslover', () => {
            const url = createUserResource.urlReslover([pathParam, queryParam]);
            expect(url).toBe('/api/users/1?page=2');
        });
        it('requestInitReslover', () => {
            const requestInit = createUserResource.requestInitReslover([bodyParams]) as RequestInit;
            const requestheaders = requestInit.headers as Headers;
            const requestContentType = requestheaders.get('Content-Type');

            expect(requestInit.method).toBe(createUserResource.method!);
            expect(requestContentType).toBe('application/json');
            expect(requestInit.body).toBe(JSON.stringify(bodyParams.value));
        });
    });
});