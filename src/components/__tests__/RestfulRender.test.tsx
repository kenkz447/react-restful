import * as React from 'react';
import { mockResponse } from 'jest-fetch-mock';
import * as ReactTestRenderer from 'react-test-renderer';

import { RestfulRender } from '../RestfulRender';
import { SchemaField, ResourceType } from '../../utilities/ResourceType';
import { Resource, ResourceParameter, Store } from '../../utilities';
import { PropsSetter } from '../PropsSetter';

interface User {
    _id: number;
    username: string;
}

interface Pagination<T> {
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
                resourceType.dataMapping(user);
            }
        }
    });

    const testUserData = {
        content: [{
            _id: 2
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

    let render = jest.fn((renderProps) => {
        return 'loading';
    });

    const mockResponseDataStr = JSON.stringify(testUserData);
    mockResponse(mockResponseDataStr, {
        headers: { 'content-type': 'application/json' }
    });

    const restfulRender = ReactTestRenderer.create(
        <PropsSetter>
            <RestfulRender<Pagination<User>>
                store={store}
                resource={getUserByBranchResource}
                parameters={paramsProps}
                render={render}
            />
        </PropsSetter>
    );

    const restfulRenderInstance = restfulRender.getInstance() as ReactTestRenderer.ReactTestInstance;

    describe('init', () => {
        it('render with initial renderProps', () => {
            expect(render).toBeCalledWith({
                error: null,
                data: null
            });
        });
    });

    describe('when props change', () => {
        it('nothing change', () => {
            render.mockClear();

            restfulRenderInstance.setProps({
                store: store,
                resource: getUserByBranchResource,
                parameters: paramsProps,
                render: render
            });

            expect(render).not.toBeCalled();
        });

        it('refetch data when `parameters` change', () => {
            render.mockClear();
            paramsProps = [...paramsProps];

            restfulRenderInstance.setProps({
                store: store,
                resource: getUserByBranchResource,
                parameters: paramsProps,
                render: render
            });

            expect(render).toBeCalledWith({
                error: null,
                data: testUserData
            });
        });

        it('refetch data when `resource` change', () => {
            render.mockClear();
            paramsProps = [...paramsProps];

            getUserByBranchResource = new Resource<Pagination<User>>({
                resourceType: userResourceType,
                method: 'GET',
                url: '/api/users/{branch}',
                mapDataToStore: getUserByBranchResource.mapDataToStore
            });

            restfulRenderInstance.setProps({
                store: store,
                resource: getUserByBranchResource,
                parameters: paramsProps,
                render: render
            });

            expect(render).toBeCalledWith({
                error: null,
                data: testUserData
            });
        });
        it('refetch data when `render` change', () => {
            render.mockClear();
            paramsProps = [...paramsProps];

            render = jest.fn(() => {
                return 'loading';
            });

            restfulRenderInstance.setProps({
                store: store,
                resource: getUserByBranchResource,
                parameters: paramsProps,
                render: render
            });

            expect(render).toBeCalledWith({
                error: null,
                data: testUserData
            });
        });
    });
});