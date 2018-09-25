import { mockResponseOnce } from 'jest-fetch-mock';
import { Fetcher } from '../Fetcher';
import { Resource, ResourceParameter } from '../Resource';
import { Store } from '../Store';

import { userResourceType, User } from '../../test-resources';

describe('Fetcher', () => {
    const newUser: User = {
        id: 1,
        name: 'user01'
    };

    const mapDataToStore = jest.fn(() => void 0);

    const createUserResource = new Resource({
        resourceType: userResourceType,
        method: 'POST',
        url: '/api/users',
        mapDataToStore: mapDataToStore
    });

    const store = new Store();
    store.registerRecordType(userResourceType);

    const fetcher = new Fetcher({
        store: store,
        beforeFetch: jest.fn((url: string, requestInit: RequestInit) => requestInit),
        afterFetch: jest.fn((response: Response) => void 0),
    });

    describe('instance methods', () => {
        it('fetch', async () => {
            expect.assertions(1);

            const mockResponseData = [newUser];
            const mockResponseDataStr = JSON.stringify(mockResponseData);
            mockResponseOnce(mockResponseDataStr);

            const response = await fetcher.fetch('/api', {});
            const data = await response.json();
            expect(data).toEqual(mockResponseData);
        });

        it('fetch resource', async () => {
            expect.assertions(3);

            const mockResponseData = newUser;
            const mockResponseDataStr = JSON.stringify(mockResponseData);
            mockResponseOnce(mockResponseDataStr, {
                headers: { 'content-type': 'application/json' }
            });

            const fetchBodyParam: ResourceParameter = {
                type: 'body',
                value: newUser,
            };

            const fetchParams = [fetchBodyParam];
            const data = await fetcher.fetchResource(createUserResource, fetchParams);
            expect(data).toEqual(newUser);

            const requestInit = createUserResource.requestInitReslover(fetchParams);

            expect(fetcher.props.beforeFetch).toBeCalledWith(
                createUserResource.url,
                requestInit
            );

            expect(fetcher.props.afterFetch).toBeCalled();
        });
    });

    describe('data mapping', () => {
        it('after fetch', () => {
            expect(mapDataToStore).toBeCalled();
        });
    });
});