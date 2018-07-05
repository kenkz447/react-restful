import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

import { restfulPagination, PaginationProps } from '../restfulPagination';
import { Store, ResourceType } from '../../utilities';
import { PropsSetter } from '../PropsSetter';

interface User {
    _id: number;
}

describe('restfulPagination', () => {
    const render = jest.fn(() => <div />);
    class Pagination extends React.Component<PaginationProps<User>> {
        render() {
            return render(this.props);
        }
    }

    const store = new Store();
    const userResourceType = new ResourceType({
        name: 'user',
        schema: [{
            field: '_id',
            type: 'PK'
        }]
    });

    store.registerRecordType(userResourceType);

    let userData = [{
        _id: 1,
        username: 'user_1'
    }, {
        _id: 2,
        username: 'user_2'
    }];

    const paginationData = {
        data: userData,
        currentPage: 1,
        totalItems: 50,
        pageSize: 10
    };

    const PaginationHOC = restfulPagination<User>({
        store: store,
        resourceType: userResourceType,
    })(Pagination);

    const pagination = ReactTestRenderer.create(
        <PropsSetter>
            <PaginationHOC {...paginationData} />
        </PropsSetter>
    );

    it('initial render', () => {
        expect(render).toBeCalledWith(paginationData);
    });
    describe('store', () => {
        it('new record mapping to store', () => {
            render.mockClear();
            userResourceType.dataMapping({
                _id: 3
            });
            expect(render).not.toBeCalled();
        });
        it('update exist record', () => {
            render.mockClear();
            const testUser = userData.find(o => o._id === 1);
            if (testUser) {
                testUser.username = 'update';
            }

            userResourceType.dataMapping({
                _id: 1,
                username: 'update'
            });

            expect(render).toBeCalledWith({
                ...paginationData,
                data: userData
            });
        });
        it('remove record in the list', () => {
            render.mockClear();

            userData = userData.filter(o => o._id !== 1);

            store.removeRecord(userResourceType, {
                _id: 1,
            });

            expect(render).toBeCalledWith({
                ...paginationData,
                data: userData
            });
        });
    });
});