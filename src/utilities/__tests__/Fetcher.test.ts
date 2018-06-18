import { mockResponseOnce } from 'jest-fetch-mock';
import { Fetcher } from '../Fetcher';
import { Resource, ResourceParameter } from '../Resource';
import { ResourceType } from '../ResourceType';
import { Store } from '../Store';

describe('Fetcher', () => {
    const store = new Store({
        recordKeyProperty: '_id'
    });

    const fetcher = new Fetcher({ store });
    const newUser = { _id: 1 };

    const mapRecordToStore = jest.fn(() => {
        // do something...
    });

    const createUserResource = new Resource({
        resourceType: new ResourceType({
            name: 'user',
            schema: [{
                property: '_id',
                type: 'PK',
            }]
        }),
        method: 'POST',
        url: '/api/users',
        mapRecordToStore: mapRecordToStore
    });

    describe('instance', () => {
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
            const mockResponseData = newUser;
            const mockResponseDataStr = JSON.stringify(mockResponseData);
            mockResponseOnce(mockResponseDataStr);

            const fetchParam: ResourceParameter = {
                type: 'body',
                value: newUser,
            };

            const data = await fetcher.fetchResource(createUserResource, [fetchParam]);
            expect(data).toEqual(newUser);
        });
    });

    describe('data mapping', () => {
        it('after fetch', () => {
            expect(mapRecordToStore).toBeCalledWith(newUser, store);
        });
    });
});