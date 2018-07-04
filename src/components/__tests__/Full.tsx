import { mockResponse } from 'jest-fetch-mock';
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import { Resource, ResourceParameter, Store } from '../../utilities';
import { RecordType } from '../../utilities/RecordTable';
import { ResourceType, SchemaField } from '../../utilities/ResourceType';
import { PropsSetter } from '../PropsSetter';
import { RestfulEntry } from '../RestfulEntry';
import { PaginationProps, restfulPagination } from '../restfulPagination';
import { RestfulRender } from '../RestfulRender';

interface User extends RecordType {
    _id: number;
    username: string;
}

interface DataModel {
    content: User[];
}

describe('Full', () => {
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

    let getUserByBranchResource = new Resource<DataModel>({
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

    const restfulEntryRender = jest.fn((restfulEntryProps) => {
        return null;
    });

    const paginationRender = jest.fn((paginationRenderProps: PaginationProps<User>) => {
        return paginationRenderProps.data.map(o => {
            return (
                <RestfulEntry<User>
                    key={o._id}
                    store={store}
                    recordkey={o._id}
                    resourceType={userResourceType}
                >
                    {restfulEntryRender}
                </RestfulEntry>
            );
        });
    });

    class Pagination extends React.Component<PaginationProps<User>> {
        render() {
            return paginationRender(this.props);
        }
    }

    const PaginationHOC = restfulPagination<User>({
        store: store,
        resourceType: userResourceType,
    })(Pagination);

    let render = jest.fn((renderProps: DataModel) => {
        return <PaginationHOC data={renderProps.content} />;
    });

    const mockResponseDataStr = JSON.stringify(testUserData);
    mockResponse(mockResponseDataStr, {
        headers: { 'content-type': 'application/json' }
    });

    const restfulRender = ReactTestRenderer.create(
        <PropsSetter>
            <RestfulRender<DataModel>
                store={store}
                resource={getUserByBranchResource}
                parameters={paramsProps}
                render={render}
            />
        </PropsSetter>
    );

    const restfulRenderInstance = restfulRender.getInstance() as ReactTestRenderer.ReactTestInstance;

    it('render entries after fetch', () => {
        expect(restfulEntryRender.mock.calls).toEqual([
            [testUserData[0]],
            [testUserData[1]],
          ]);
    });
});