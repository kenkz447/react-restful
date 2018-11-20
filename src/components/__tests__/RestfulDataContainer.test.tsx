import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

import { RestfulDataContainer, RestfulDataContainerProps } from '../RestfulDataContainer';
import { User, userResourceType } from '../../test-resources';
import { setupEnvironment, Store } from '../../utilities';

describe('RestfulDataContainer', () => {
    const initDataSource: User[] = [{
        id: 1,
        name: 'test'
    }];

    const { store } = setupEnvironment({
        store: new Store()
    });

    store.registerRecord(userResourceType);
    store.dataMapping(userResourceType, initDataSource);

    const render = jest.fn((props) => null);
    const restfulDataContainerProps: RestfulDataContainerProps<User> = {
        dataSource: initDataSource,
        resourceType: userResourceType,
        children: render
    };

    const restfulDataContainer = ReactTestRenderer.create(
        <RestfulDataContainer
            {...restfulDataContainerProps}
            shouldConcatSources={false}
        />
    );

    it('should render without error', () => {
        expect(render).toBeCalledWith(initDataSource);
    });

    it('should replace old source', () => {
        jest.clearAllMocks();

        const updatedDataSource: User[] = [{
            id: 2,
            name: 'test2'
        }];

        restfulDataContainer.update(
            <RestfulDataContainer
                {...restfulDataContainerProps}
                dataSource={updatedDataSource}
            />
        );

        expect(render).toBeCalledWith(updatedDataSource);
    });

    it('should concat new source and old source', () => {
        const updatedDataSource: User[] = [{
            id: 3,
            name: 'test3'
        }];

        restfulDataContainer.update(
            <RestfulDataContainer
                {...restfulDataContainerProps}
                shouldConcatSources={true}
                dataSource={updatedDataSource}
            />
        );

        expect(render).toBeCalledWith([
            {
                id: 2,
                name: 'test2'
            },
            ...updatedDataSource,
        ]);
    });

    it('should sorting source', () => {
        render.mockClear();

        const updatedDataSource: User[] = [{
            id: 1,
            name: 'test1'
        }, {
            id: 3,
            name: 'test3'
        }, {
            id: 2,
            name: 'test2'
        }];

        restfulDataContainer.update(
            <RestfulDataContainer
                {...restfulDataContainerProps}
                dataSource={updatedDataSource}
                sort={(item, item2) => {
                    if (item.id < item2.id) {
                        return 1;
                    }

                    if (item.id < item2.id) {
                        return -1;
                    }

                    return 0;
                }}
            />
        );

        expect(render.mock.calls[0][0]).toEqual([{
            id: 3,
            name: 'test3'
        }, {
            id: 2,
            name: 'test2'
        }, {
            id: 1,
            name: 'test1'
        }]);
    });

    it('should update data source if existing record re-mapping', () => {
        restfulDataContainer.update(
            <RestfulDataContainer
                {...restfulDataContainerProps}
                dataSource={[{ id: 1, name: 'user1' }]}
            />
        );

        const updateUser = { id: 1, name: 'user1Updated' };
        store.dataMapping(userResourceType, updateUser);

        expect(render).toBeCalledWith([updateUser]);
    });

    it('should push to source if new record mapping', () => {
        render.mockClear();

        const newUser = { id: 100, name: 'user100' };
        store.dataMapping(userResourceType, newUser);

        expect(render).toBeCalledWith([
            { id: 1, name: 'user1Updated' },
            newUser
        ]);
    });

    it('should remove from source if existing record un-mapping', () => {
        render.mockClear();

        const newUser = { id: 100, name: 'user100' };
        store.removeRecord(userResourceType, newUser);

        expect(render).toBeCalledWith([
            { id: 1, name: 'user1Updated' }
        ]);
    });

    it('should not redender if not match filter', () => {
        restfulDataContainer.update(
            <RestfulDataContainer
                {...restfulDataContainerProps}
                dataSource={[{ id: 1, name: 'user1' }]}
                shouldAppendNewRecord={(record) => record.name.startsWith('user')}
            />
        );

        render.mockClear();

        const updateUser = { id: 99, name: '_user99' };
        store.dataMapping(userResourceType, updateUser);

        expect(render).not.toBeCalled();
    });

    it('should redender if event records match filter', () => {
        render.mockClear();

        const updateUser = { id: 99, name: 'user99' };
        store.dataMapping(userResourceType, [updateUser]);

        expect(render).toBeCalledWith([
            { id: 1, name: 'user1' },
            updateUser
        ]);
    });
});