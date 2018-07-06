import { mockResponse } from 'jest-fetch-mock';
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import { Resource, ResourceParameter, Store } from '../../utilities';
import { RecordType } from '../../utilities/RecordTable';
import { ResourceType, SchemaField } from '../../utilities/ResourceType';
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

    const restfulEntryRender = jest.fn(() => {
        return null;
    });

    class Pagination extends React.Component<PaginationProps<User>> {
        render() {
            return this.props.data.map(o => {
                return (
                    <RestfulEntry<User>
                        key={o._id}
                        store={store}
                        recordKey={o._id}
                        resourceType={userResourceType}
                        render={restfulEntryRender}
                    />
                );
            });
        }
    }

    const PaginationHOC = restfulPagination<User>({
        store: store,
        resourceType: userResourceType,
    })(Pagination);

    const mockResponseDataStr = JSON.stringify(testUserData);
    mockResponse(mockResponseDataStr, {
        headers: { 'content-type': 'application/json' }
    });

    const restfulRender = ReactTestRenderer.create(
        <RestfulRender<DataModel>
            store={store}
            resource={getUserByBranchResource}
            parameters={paramsProps}
            render={(renderProps) => {
                if (renderProps.data && Array.isArray(renderProps.data.content)) {
                    return <PaginationHOC data={renderProps.data.content} />;
                }
                return null;
            }}
        />
    );

    it('render entries after fetch', () => {
        expect.assertions(3);

        let syncWithStoreEntries = [];
        for (const call of restfulEntryRender.mock.calls) {
            const syncFunc = call[0].syncWithStore;
            expect(typeof syncFunc).toBe('function');
            syncWithStoreEntries.push(syncFunc);
        }

        expect(restfulEntryRender.mock.calls).toEqual([
            [{
                record: testUserData.content[0],
                recordKey: testUserData.content[0]._id,
                status: 'synced',
                syncWithStore: syncWithStoreEntries[0]
            }, {}],
            [{
                record: testUserData.content[1],
                recordKey: testUserData.content[1]._id,
                status: 'synced',
                syncWithStore: syncWithStoreEntries[1]
            }, {}],
        ]);
    });
});