import { RecordType } from '../RecordTable';
import { Resource, ResourceParameter } from '../Resource';
import { ResourceType, SchemaField } from '../ResourceType';

interface User extends RecordType {
    _id: number;
}

describe('Resource', () => {
    const commonPK: SchemaField = {
        field: '_id',
        type: 'PK'
    };

    const branchResourceType = new ResourceType({
        name: 'branch',
        schema: [commonPK, {
            type: 'MANY',
            field: 'users',
            resourceType: 'user'
        }]
    });

    const bookingResourceType = new ResourceType({
        name: 'booking',
        schema: [commonPK, {
            type: 'FK',
            field: 'user',
            resourceType: 'user'
        }]
    });

    const userResourceType = new ResourceType({
        name: 'user',
        schema: [
            commonPK, {
                type: 'FK',
                field: 'branch',
                resourceType: branchResourceType.name
            }, {
                type: 'MANY',
                field: 'bookings',
                resourceType: bookingResourceType.name
            }
        ]
    });

    const mapDataToStore = jest.fn((record, store) => {
        store.mapRecord('user', record);
    });

    const createUserResource = new Resource<User>({
        resourceType: userResourceType,
        method: 'POST',
        url: '/api/users/{branch}',
        mapDataToStore: mapDataToStore
    });

    const pathParam: ResourceParameter = {
        type: 'path',
        parameter: 'branch',
        value: 1
    };
    const queryParam: ResourceParameter = {
        type: 'query',
        parameter: 'page',
        value: 2
    };
    const bodyParams: ResourceParameter = {
        type: 'body',
        value: { _id: 1 }
    };

    describe('instance', () => {
        it('urlReslover', () => {
            const url = createUserResource.urlReslover([pathParam, queryParam]);
            expect(url).toBe('/api/users/1?page=2');
        });
        it('requestInitReslover', () => {
            const requestInit = createUserResource.requestInitReslover([bodyParams]);
            const requestheaders = requestInit.headers as Headers;
            const requestContentType = requestheaders.get('Content-Type');

            expect(requestInit.method).toBe(createUserResource.method);
            expect(requestContentType).toBe('application/json');
            expect(requestInit.body).toBe(JSON.stringify(bodyParams.value));
        });
    });
});