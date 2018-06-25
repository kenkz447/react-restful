import { mockResponseOnce } from 'jest-fetch-mock';
import { Fetcher } from '../Fetcher';
import { Resource, ResourceParameter } from '../Resource';
import { ResourceType } from '../ResourceType';
import { Store } from '../Store';

describe('Fetcher', () => {

    const newUser = { _id: 1 };

    const mapDataToStore = jest.fn(() => {
        // do something...
    });

    const resourceType = new ResourceType({
        name: 'user',
        schema: [{
            field: '_id',
            type: 'PK',
        }]
    });

    const createUserResource = new Resource({
        resourceType: resourceType,
        method: 'POST',
        url: '/api/users',
        mapDataToStore: mapDataToStore
    });

    const store = new Store();

    store.registerRecordType(resourceType);

    const fetcher = new Fetcher({ store });

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
            mockResponseOnce(mockResponseDataStr, {
                headers: { 'content-type': 'application/json' }
            });

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
            expect(mapDataToStore).toBeCalled();
        });
    });
});