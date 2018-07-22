import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import { RecordType, ResourceType, Store } from '../../utilities';
import { PropsSetter } from '../PropsSetter';
import { RestfulEntry, RestfulEntryProps, RestfulEntryRenderProps } from '../RestfulEntry';

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

    const render = jest.fn(() => null);

    const restfullEntryProps = {
        store: store,
        resourceType: userResourceType,
        recordKey: userData._id,
        render: render,
    };

    const element = ReactTestRenderer.create(
        <PropsSetter>
            <RestfulEntry<User> {...restfullEntryProps} />
        </PropsSetter>
    );

    // tslint:disable-next-line:no-any
    const elementInstance: PropsSetter<RestfulEntryProps<User>> = element.getInstance() as any;

    let syncWithStore: () => void;
    let entryRenderProps: RestfulEntryRenderProps<User>;

    describe('init', () => {
        it('render function called', () => {
            expect(render).toBeCalled();
        });

        it('initial render with data in store', () => {
            entryRenderProps = render.mock.calls[0][0];
            syncWithStore = entryRenderProps.syncWithStore;

            expect(typeof syncWithStore).toBe('function');
            expect(entryRenderProps).toEqual({
                recordKey: 1,
                record: userData,
                status: 'synced',
                syncWithStore: syncWithStore
            });
        });
    });

    describe('non-auto rerender when data has update', () => {
        it('entry outdate when store has been updated', () => {
            render.mockClear();

            store.mapRecord(userResourceType, {
                ...userData,
                username: 'update'
            });

            entryRenderProps = render.mock.calls[0][0];
            syncWithStore = entryRenderProps.syncWithStore;

            expect(render).toBeCalledWith({
                recordKey: 1,
                record: userData,
                status: 'outdate',
                syncWithStore: syncWithStore
                // tslint:disable-next-line:align
            }, {});
        });
        it('call sync with store up update record', () => {
            render.mockClear();

            userData = {
                ...userData,
                username: 'update'
            };

            syncWithStore();

            expect(render).toBeCalledWith({
                recordKey: 1,
                record: userData,
                status: 'synced',
                syncWithStore: syncWithStore
                // tslint:disable-next-line:align
            }, {});
        });
    });
    describe('auto sync with store', () => {
        beforeAll(() => {
            elementInstance.setProps({
                ...restfullEntryProps,
                autoSyncWithStore: true,
            });
        });

        it('auto sync with store when record has been updated', () => {
            render.mockClear();
            userData = {
                ...userData,
                username: 'update with auto sync'
            };

            store.mapRecord(userResourceType, userData);

            expect(render).toBeCalledWith({
                recordKey: 1,
                record: userData,
                status: 'synced',
                syncWithStore: syncWithStore
                // tslint:disable-next-line:align
            }, {});
        });
    });
});