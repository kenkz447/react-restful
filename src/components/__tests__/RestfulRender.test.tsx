import fetch, { mockResponse } from 'jest-fetch-mock';
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import { Resource, ResourceParameter, Store } from '../../utilities';
import { RecordType } from '../../utilities/RecordTable';
import { ResourceType, SchemaField } from '../../utilities/ResourceType';
import { PropsSetter } from '../PropsSetter';
import { RestfulRender, RestfulRenderProps } from '../RestfulRender';

interface User extends RecordType {
    _id: number;
    username: string;
}

interface Pagination<T extends RecordType = User> {
    content: T[];
    total: number;
    currentPage: number;
    hasNextPage: boolean;
}

describe('RestfulRender', () => {
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

    let getUserByBranchResource = new Resource<Pagination<User>>({
        resourceType: userResourceType,
        method: 'GET',
        url: '/api/users/{branch}',
        mapDataToStore: (data, resourceType, storeX) => {
            for (const user of data.content) {
                storeX.dataMapping(resourceType, user);
            }
        }
    });

    const testUserData = {
        content: [{
            _id: 1
        }, {
            _id: 2
        }]
    };

    const pathParam: ResourceParameter = {
        type: 'path',
        parameter: 'branch',
        value: 1
    };

    let paramsProps = [pathParam];

    const store = new Store();

    store.registerRecordType(branchResourceType);
    store.registerRecordType(userResourceType);
    store.registerRecordType(bookingResourceType);

    let render = jest.fn((renderProps: Pagination<User>) => {
        return 'loading';
    });

    const mockResponseDataStr = JSON.stringify(testUserData);
    mockResponse(mockResponseDataStr, {
        headers: { 'content-type': 'application/json' }
    });

    const restfulRender = ReactTestRenderer.create(
        <PropsSetter>
            <RestfulRender
                store={store}
                resource={getUserByBranchResource}
                parameters={paramsProps}
                render={render}
            />
        </PropsSetter>
    );

    // tslint:disable-next-line:no-any
    const restfulRenderInstance: PropsSetter<RestfulRenderProps<Pagination>> = restfulRender.getInstance() as any;

    describe('init props', () => {
        it('two first render props', () => {
            expect(render.mock.calls.length).toBe(2);
            expect(render.mock.calls[0][0]).toEqual({
                error: null,
                data: null,
                fetching: true
            });
            expect(render.mock.calls[1][0]).toEqual({
                error: null,
                data: testUserData,
                fetching: false
            });
        });
    });
});