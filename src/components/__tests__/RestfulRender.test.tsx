import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import fetch from 'jest-fetch-mock';
import {
    Fetcher,
    RequestParameter,
    Resource,
    Store
    } from '../../core';
import { RestfulRender, RestfulRenderChildProps } from '../RestfulRender';
import { User, userResourceType } from '../../test-resources';


describe('RestfulRender', () => {
    const restfulStore = new Store();
    const fetcher = new Fetcher({
        store: restfulStore
    });
    restfulStore.registerResourceType(userResourceType);

    let getUserByBranchResource = new Resource<User, User[]>({
        resourceType: userResourceType,
        method: 'GET',
        url: '/api/users/{branch}',
        mapDataToStore: (users, resourceType, store) => {
            store.dataMapping(resourceType, users);
        }
    });

    const testUserData: User[] = [
        { id: 1, name: '1' },
        { id: 2, name: '1' }
    ];

    const pathParam: RequestParameter = {
        type: 'path',
        parameter: 'branch',
        value: 1
    };

    let paramsProps = [pathParam];

    const mockResponseDataStr = JSON.stringify(testUserData);

    describe('init props', () => {
        const render = jest.fn<null, RestfulRenderChildProps<User[]>[]>(() => null);
        const onFetchCompleted = jest.fn();

        fetch.mockResponse(mockResponseDataStr, {
            headers: { 'content-type': 'application/json' }
        });

        const restfulRender = ReactTestRenderer.create(
            <RestfulRender
                fetcher={fetcher}
                resource={getUserByBranchResource}
                parameters={paramsProps}
                onFetchCompleted={onFetchCompleted}
                render={render}
            />
        );

        const restfulRenderInstance = restfulRender.root.instance as RestfulRender<User[]>;
        const refetchFunc = restfulRenderInstance.fetching;

        it('should render with init props', () => {
            expect(render.mock.calls[0][0]).toEqual({
                error: null,
                data: null,
                fetching: true,
                refetch: refetchFunc
            });
        });

        it('should render null if no render prop', () => {
            const restfulRender2 = ReactTestRenderer.create(
                <RestfulRender
                    fetcher={fetcher}
                    resource={getUserByBranchResource}
                    parameters={paramsProps}
                    onFetchCompleted={onFetchCompleted}
                />
            );

            expect(restfulRender2.toJSON()).toEqual(null);
        });

        it('should re-render when fetch complete', () => {
            expect(render.mock.calls[1][0]).toEqual({
                error: null,
                data: testUserData,
                fetching: false,
                refetch: refetchFunc
            });
            expect(onFetchCompleted).toBeCalledWith(testUserData);
        });

        const error = new Error('Fetch mock failed');
        it('should re-render when params change', () => {
            render.mockClear();
            fetch.mockClear();

            fetch.mockRejectOnce(error);
            restfulRender.update(
                <RestfulRender
                    fetcher={fetcher}
                    resource={getUserByBranchResource}
                    onFetchCompleted={onFetchCompleted}
                >
                    {render}
                </RestfulRender>
            );

            expect(render).toBeCalledWith(
                {
                    error: null,
                    data: testUserData,
                    fetching: true,
                    refetch: refetchFunc
                },
                {}
            );
            render.mockClear();
        });

        it('should re-render with error when fetch fail', () => {
            expect(render).toBeCalledWith(
                {
                    error: error,
                    data: testUserData,
                    fetching: false,
                    refetch: refetchFunc
                },
                {}
            );
        });
    });

    describe('default data props', () => {
        const initDataRender = jest.fn(() => null);
        const initDataOnFetchCompleted = jest.fn();

        const restfulRender = ReactTestRenderer.create(
            <RestfulRender
                fetcher={fetcher}
                resource={getUserByBranchResource}
                parameters={paramsProps}
                onFetchCompleted={initDataOnFetchCompleted}
                initData={testUserData}
                render={initDataRender}
            />
        );

        const restfulRenderInstance = restfulRender.root.instance as RestfulRender<User[]>;
        const refetchFunc = restfulRenderInstance.fetching;

        it('should render with default data without fetch', () => {
            expect(initDataRender).toBeCalledWith(
                {
                    error: null,
                    data: testUserData,
                    fetching: false,
                    refetch: refetchFunc
                },
                {}
            );
            expect(initDataOnFetchCompleted).not.toBeCalled();
        });
    });

    describe('render props as children', () => {
        const render = jest.fn(() => null);

        const restfulRender = ReactTestRenderer.create(
            <RestfulRender
                fetcher={fetcher}
                resource={getUserByBranchResource}
                parameters={paramsProps}
                initData={testUserData}
            >
                {render}
            </RestfulRender>
        );

        const restfulRenderInstance = restfulRender.root.instance as RestfulRender<User[]>;
        const refetchFunc = restfulRenderInstance.fetching;

        it('should render with default data without fetch', () => {
            expect(render).toBeCalledWith({
                error: null,
                data: testUserData,
                fetching: false,
                refetch: refetchFunc
            });
        });
    });
});