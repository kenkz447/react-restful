import { Resource } from '../Resource';
import { User } from '../../test-resources';
import { RequestParameter } from '../Fetcher';
import { isDate } from 'util';

describe('Resource', () => {
    const getUsersResource = new Resource<User>({
        url: 'http://localhost:3000/api/users'
    });

    const getUserByIdResource = new Resource<User>({
        url: 'api/users/:id'
    });

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
        it('should GET is default method', () => {
            expect(getUsersResource.props.method).toBe('GET');
        });

        it('should auto append "/" to url', () => {
            expect(getUserByIdResource.props.url).toBe('/api/users/:id');
        });

        it('urlReslover', () => {
            const url = createUserResource.urlReslover([pathParam, queryParam]);
            expect(url).toBe('/api/users/1?page=2');
        });

        it('urlReslover with default params', () => {
            createUserResource.props.getDefaultParams = () => [{ type: 'query', parameter: 'order', value: 'id_desc' }];
            const url = createUserResource.urlReslover([pathParam, queryParam]);
            expect(url).toBe('/api/users/1?page=2&order=id_desc');
        });

        it('urlReslover with default param and requestUrlParamParser', () => {
            const now = new Date();

            createUserResource.props.getDefaultParams = () => ({
                type: 'query',
                parameter: 'start',
                value: now
            });

            const url = createUserResource.urlReslover(
                [pathParam, queryParam],
                (val) => {
                    if (isDate(val)) {
                        return val.toISOString();
                    }
                    return val;
                }
            );
            const search = new URLSearchParams(`?page=2&start=${now.toISOString()}`);
            expect(url).toBe(`/api/users/1?${search.toString()}`);
        });

        it('requestInitReslover', () => {
            const requestInit = createUserResource.requestInitReslover([bodyParams]) as RequestInit;
            const requestheaders = requestInit.headers as Headers;
            const requestContentType = requestheaders.get('Content-Type');

            expect(requestInit.method).toBe(createUserResource.props.method!);
            expect(requestContentType).toBe('application/json');
            expect(requestInit.body).toBe(JSON.stringify(bodyParams.value));
        });

        it('requestInitReslover with requestBodyParser', () => {
            // tslint:disable-next-line:no-any
            const requestBodyParser = (key: string, val: any) => {
                if (isDate(val)) {
                    return val.toISOString();
                }
                return val;
            };

            const now = new Date();
            const requestInit = createUserResource.requestInitReslover(
                [{
                    type: 'body',
                    value: {
                        id: 2,
                        createdAt: now
                    }
                }],
                requestBodyParser
            ) as RequestInit;

            expect(requestInit.body).toBe(`{"id":2,"createdAt":"${now.toISOString()}"}`);
        });
    });
});