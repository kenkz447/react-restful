import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import { ResourceType, Store, RecordType } from '../../utilities';
import { PropsSetter } from '../PropsSetter';
import { RestfulDataContainerComponentProps, restfulDataContainer } from '../restfulDataContainer';

interface User extends RecordType {
    _id: number;
}

describe('restfulDataContainer', () => {
    const render = jest.fn(() => <div />);
    class Pagination extends React.Component<RestfulDataContainerComponentProps<User>> {
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

    const testData = {
        data: [{
            _id: 1,
            username: 'user1'
        }, {
            _id: 2,
            username: 'user2'
        }]
    };

    const PaginationHOC = restfulDataContainer<User, { data: User[] }>({
        store: store,
        resourceType: userResourceType,
        mapToProps: (data: User[]) => ({ data })
    })(Pagination);

    const pagination = ReactTestRenderer.create(
        <PropsSetter>
            <PaginationHOC data={testData.data} />
        </PropsSetter>
    );

    it('initial render', () => {
        expect(render).toBeCalledWith(testData);
    });
    describe('store', () => {
        it('record mapping', () => {
            render.mockClear();
            store.dataMapping(userResourceType, {
                _id: 3
            });
            expect(render).not.toBeCalled();
        });
        it('nothing happen when a record(not in `data`) remove', () => {
            render.mockClear();
            store.removeRecord(userResourceType, { _id: 3 });
            expect(render).not.toBeCalled();
        });
        it('rerender when existing record remove', () => {
            render.mockClear();
            store.removeRecord(userResourceType, { _id: 2 });

            testData.data.pop();
            expect(render).toBeCalledWith(testData);
        });
    });
});