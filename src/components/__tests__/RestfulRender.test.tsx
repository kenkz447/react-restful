import fetch, { mockResponse } from 'jest-fetch-mock';
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import { Resource, ResourceParameter, Store, Fetcher } from '../../utilities';
import { PropsSetter } from '../PropsSetter';
import { RestfulRender, RestfulRenderProps } from '../RestfulRender';

import { userResourceType, User } from '../../test-resources';

describe('RestfulRender', () => {

    const restfulStore = new Store();
    const fetcher = new Fetcher({
        store: restfulStore
    });
    restfulStore.registerRecordType(userResourceType);

    let getUserByBranchResource = new Resource<User[]>({
        resourceType: userResourceType,
        method: 'GET',
        url: '/api/users/{branch}',
        mapDataToStore: (users, resourceType, store) => {
            for (const user of users) {
                store.dataMapping(resourceType, user);
            }
        }
    });

    const testUserData: User[] = [
        { id: 1, name: '1' },
        { id: 2, name: '1' }
    ];

    const pathParam: ResourceParameter = {
        type: 'path',
        parameter: 'branch',
        value: 1
    };

    let paramsProps = [pathParam];

    let render = jest.fn((renderProps) => {
        return 'loading';
    });
    const onFetchCompleted = jest.fn();
    const mockResponseDataStr = JSON.stringify(testUserData);
    mockResponse(mockResponseDataStr, {
        headers: { 'content-type': 'application/json' }
    });

    const restfulRender = ReactTestRenderer.create(
        <PropsSetter>
            <RestfulRender
                fetcher={fetcher}
                resource={getUserByBranchResource}
                parameters={paramsProps}
                onFetchCompleted={onFetchCompleted}
            >
                {render}
            </RestfulRender>
        </PropsSetter>
    );

    const restfulRenderInstance
        // tslint:disable-next-line:no-any
        = restfulRender.getInstance() as any as PropsSetter<Partial<RestfulRenderProps<User[]>>>;

    describe('init props', () => {
        it('Props as first render', () => {
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
            expect(onFetchCompleted).toBeCalledWith(testUserData);
        });
    });

    describe('fails', () => {
        const error = new Error('Fetch mock failed');

        beforeAll(() => {
            fetch.mockRejectOnce(error);

            restfulRenderInstance.setProps({
                parameters: [pathParam]
            });
        });

        it('fetch failed', () => {
            expect(render.mock.calls[2][0]).toEqual({
                error: null,
                data: testUserData,
                fetching: true
            });

            expect(render.mock.calls[3][0]).toEqual({
                error: error,
                data: null,
                fetching: false
            });
        });
    });
});