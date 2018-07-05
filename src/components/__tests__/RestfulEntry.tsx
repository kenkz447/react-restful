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

    let userData = {
        _id: 1,
        username: 'user1'
    };

    store.mapRecord(userResourceType, userData);

    const render = jest.fn();

    const element = ReactTestRenderer.create(
        <RestfulEntry<User>
            store={store}
            resourceType={userResourceType}
            recordkey={userData._id}
            render={(props) => {
                render(props);
                return null;
            }}
        />
    );

    it('initial render with data in store', () => {
        expect(render).toBeCalledWith({
            recordKey: 1,
            record: userData
        });
    });
    it('rerender when data has update', () => {
        render.mockClear();

        userData = {
            ...userData,
            username: 'update'
        };

        store.mapRecord(userResourceType, userData);

        expect(render).toBeCalledWith({
            recordKey: 1,
            record: userData
        });
    });
});