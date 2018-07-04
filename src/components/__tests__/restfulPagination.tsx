import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import { ResourceType, Store } from '../../utilities';
import { PropsSetter } from '../PropsSetter';
import { PaginationProps, restfulPagination } from '../restfulPagination';

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
    const testData = [{
        _id: 1,
        username: 'user1'
    }, {
        _id: 2,
        username: 'user2'
    }];

    const PaginationHOC = restfulPagination<User>({
        store: store,
        resourceType: userResourceType,
    })(Pagination);

    const pagination = ReactTestRenderer.create(
        <PropsSetter>
            <PaginationHOC data={testData} />
        </PropsSetter>
    );

    it('initial render', () => {
        expect(render).toBeCalledWith({
            data: testData
        });
    });
    describe('store', () => {
        it('new record mapping', () => {
            render.mockClear();
            store.dataMapping(userResourceType, {
                _id: 3
            });
            expect(render).not.toBeCalled();
        });
        it('existing record mapping', () => {
            render.mockClear();
            store.dataMapping(userResourceType, {
                _id: 2,
                username: 'update'
            });

            const updatedUser = testData.find(o => o._id === 2);
            if (updatedUser) {
                updatedUser.username = 'update';
            }

            expect(render).toBeCalledWith(testData);
        });
        it('nothing happen when a record(not in `data`) remove', () => {
            render.mockClear();
            store.removeRecord(userResourceType, { _id: 3 });
            expect(render).not.toBeCalled();
        });
        it('rerender when existing record remove', () => {
            render.mockClear();
            store.removeRecord(userResourceType, { _id: 2 });

            testData.pop();
            expect(render).toBeCalledWith(testData);
        });
    });
});