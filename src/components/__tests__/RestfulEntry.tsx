import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import { RecordType, ResourceType, Store } from '../../utilities';
import { RestfulEntry } from '../RestfulEntry';

interface User extends RecordType {
    _id: number;
    username: string;
}

describe('RestfulEntry', () => {
    const userResourceType = new ResourceType({
        name: 'user',
        schema: [{
            field: '_id',
            type: 'PK'
        }]
    });

    const store = new Store();
    store.registerRecordType(userResourceType);

    const userData = {
        _id: 1,
        username: 'user1'
    };

    store.mapRecord(userResourceType, userData);

    const render = jest.fn((entry) => {
        return null;
    });

    const element = ReactTestRenderer.create(
        <RestfulEntry<User>
            store={store}
            resourceType={userResourceType}
            recordkey={userData._id}
        >
            {render}
        </RestfulEntry>
    );

    it('initial render', () => {
        expect(render).lastCalledWith({
            recordKey: 1,
            record: userData
        });
    });
});