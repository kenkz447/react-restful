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
    const testData = [{
        _id: 1
    }, {
        _id: 2
    }];

    const PaginationHOC = restfulPagination<User>({
        store: store,
        resourceType: userResourceType,
    })(Pagination);

    const pagination = ReactTestRenderer.create(
        <PropsSetter>
            <PaginationHOC data={testData} currentPage={1} totalItems={50} pageSize={10} />
        </PropsSetter>
    );

    it('initial render', () => {
        expect(render).toBeCalledWith({
            data: testData,
            currentPage: 1,
            totalItems: 50,
            pageSize: 10
        });
    });
    describe('store', () => {
        it('record mapping', () => {
            render.mockClear();
            userResourceType.dataMapping({
                _id: 3
            });
            //
        });
        it('record remove', () => {
            //
        });
    });
});