import fetch, { mockResponse } from 'jest-fetch-mock';
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import { Resource, ResourceParameter, Store } from '../../utilities';
import { PropsSetter } from '../PropsSetter';
import { RestfulRender, RestfulRenderProps } from '../RestfulRender';

import { userResourceType, User } from '../../test-resources';

describe('RestfulRender', () => {

    const restfulStore = new Store();
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

    const mockResponseDataStr = JSON.stringify(testUserData);
    mockResponse(mockResponseDataStr, {
        headers: { 'content-type': 'application/json' }
    });

    const restfulRender = ReactTestRenderer.create(
        <PropsSetter>
            <RestfulRender
                store={restfulStore}
                resource={getUserByBranchResource}
                parameters={paramsProps}
                render={render}
            />
        </PropsSetter>
    );

    const restfulRenderInstance
        // tslint:disable-next-line:no-any
        = restfulRender.getInstance() as any as PropsSetter<Partial<RestfulRenderProps<User[]>>>;

    describe('init props', () => {
        it('Props as first render', () => {
            expect(render.mock.calls.length).toBe(2);
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
        });
    });

    describe('xx', () => {
        const error = new Error('Fetch mock failed');

        beforeAll(() => {
            fetch.mockRejectOnce(error);

            restfulRenderInstance.setProps({
                parameters: [pathParam]
            });
        });

        it('Fetch failed', () => {
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