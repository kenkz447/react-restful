import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

import { RestfulCollection } from '../RestfulCollection';
import { User, userResourceType } from '../../test-resources';
import { setupEnvironment, Store, ResourceType } from '../../core';

describe('RestfulCollection', () => {
    const initDataSource: User[] = [{
        id: 1,
        name: 'test1'
    }, {
        id: 2,
        name: 'test2'
    }, {
        id: 3,
        name: 'test3'
    }];

    const store = new Store();
    setupEnvironment({
        store: store
    });

    store.registerResourceType(userResourceType);
    store.dataMapping(userResourceType, initDataSource);

    describe('Empty initial data', () => {
        const userResourceType2 = new ResourceType('userResourceType2');

        const render = jest.fn(() => null);

        ReactTestRenderer.create(
            <RestfulCollection
                initDataSource={[]}
                resourceType={userResourceType2}
                children={render}
            />
        );

        const record = { id: 999, name: 'user 999' };
        it('should render with new mapping record', () => {
            store.dataMapping(userResourceType2, record);

            expect(render).toBeCalledWith([record]);
        });

        it('should re-render when record remove', () => {
            render.mockClear();
            store.removeOne(userResourceType2, { id: 88 });

            expect(render).not.toBeCalled();
        });

        it('should re-render when record remove', () => {
            render.mockClear();
            store.removeOne(userResourceType2, record);

            expect(render).toBeCalledWith([]);
        });
    });

    describe('with initial records', () => {
        const render = jest.fn(() => null);

        ReactTestRenderer.create(
            <RestfulCollection
                initDataSource={initDataSource}
                resourceType={userResourceType}
                children={render}
            />
        );

        it('should render without error', () => {
            expect(render).toBeCalledWith(initDataSource);
        });

        let user4 = { id: 4, name: 'user4' };
        let nextDataSource = [...initDataSource, user4];
        it('should re-render when new record mapped', () => {
            render.mockClear();
            store.dataMapping(userResourceType, user4);
            expect(render).toBeCalledWith(nextDataSource);
        });

        it('should re-render when exist record update', () => {
            render.mockClear();

            const updatedUser4 = { ...user4, name: 'user 4 Updated' };
            nextDataSource = nextDataSource.map(o => o.id === 4 ? updatedUser4 : o);

            store.dataMapping(userResourceType, updatedUser4);
            expect(render).toBeCalledWith(nextDataSource);
        });
    });

    describe('with single record', () => {
        const initSingleRecord = { id: 99, name: 'user 99' };
        const singleInitDataSource = [initSingleRecord];
        const singleRecordRenderer = jest.fn(() => null);
        ReactTestRenderer.create(
            <RestfulCollection
                initDataSource={singleInitDataSource}
                resourceType={userResourceType}
                shouldAppendNewRecord={() => false}
                children={singleRecordRenderer}
            />
        );

        it('should render with init record', () => {
            expect(singleRecordRenderer).toBeCalledWith(singleInitDataSource);
        });

        it('should re-render when exist record was updated', () => {
            singleRecordRenderer.mockClear();

            const updatedUser = { ...initSingleRecord, name: 'user 99 updated' };
            store.dataMapping(userResourceType, updatedUser);

            expect(singleRecordRenderer).toBeCalledWith([updatedUser]);
        });
    });

    describe('Pagination mode', () => {
        const user100 = { id: 100, name: 'user 100' };
        const user101 = { id: 101, name: 'user 101' };
        const user102 = { id: 102, name: 'user 102' };
        const paginationInitDataSource = [user100, user101];
        const paginationRenderer = jest.fn(() => null);

        ReactTestRenderer.create(
            <RestfulCollection
                initDataSource={paginationInitDataSource}
                resourceType={userResourceType}
                enablePaginationMode={true}
                children={paginationRenderer}
            />
        );

        it('should render with init record', () => {
            expect(paginationRenderer).toBeCalledWith(paginationInitDataSource);
        });

        it('should replace with new records', () => {
            paginationRenderer.mockClear();

            ReactTestRenderer.create(
                <RestfulCollection
                    initDataSource={[user102]}
                    resourceType={userResourceType}
                    enablePaginationMode={true}
                    children={paginationRenderer}
                />
            );

            expect(paginationRenderer).toBeCalledWith([user102]);
        });
    });
});