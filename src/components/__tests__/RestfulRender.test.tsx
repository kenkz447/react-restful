import fetch, { mockResponse } from 'jest-fetch-mock';
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import { Resource, RequestParameter, Store, Fetcher } from '../../utilities';
import { PropsSetter } from '../PropsSetter';
import { RestfulRender, RestfulRenderProps, RestfulRenderChildProps } from '../RestfulRender';
import { withRestfulData } from '../restfulDataContainer';

import { userResourceType, User } from '../../test-resources';

describe('RestfulRender', () => {

    const restfulStore = new Store();
    const fetcher = new Fetcher({
        store: restfulStore
    });
    restfulStore.registerRecord(userResourceType);

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

    const pathParam: RequestParameter = {
        type: 'path',
        parameter: 'branch',
        value: 1
    };

    let paramsProps = [pathParam];

    let render = jest.fn((renderProps) => null);

    const onFetchCompleted = jest.fn();

    const mockResponseDataStr = JSON.stringify(testUserData);

    mockResponse(mockResponseDataStr, {
        headers: { 'content-type': 'application/json' }
    });

    const Container = withRestfulData<User, RestfulRenderChildProps<User[]>>({
        store: restfulStore,
        resourceType: userResourceType,
        registerToTracking: (ownProps) => {
            return ownProps.data || [];
        },
        mapToProps: (users, ownProps) => {
            return ownProps;
        }
    });

    const restfulRender = ReactTestRenderer.create(
        <PropsSetter>
            <RestfulRender
                fetcher={fetcher}
                resource={getUserByBranchResource}
                parameters={paramsProps}
                onFetchCompleted={onFetchCompleted}
                Container={Container}
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