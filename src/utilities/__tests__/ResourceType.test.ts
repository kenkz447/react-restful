import { RecordTable } from '../RecordTable';
import { ResourceType, SchemaField } from '../ResourceType';
import { Store } from '../Store';

describe('ResourceType', () => {
    const commonPK: SchemaField = {
        field: '_id',
        type: 'PK'
    };

    const branchResourceType = new ResourceType({
        name: 'branch',
        schema: [commonPK, {
            type: 'MANY',
            field: 'users',
            resourceType: 'user'
        }]
    });

    const bookingResourceType = new ResourceType({
        name: 'booking',
        schema: [commonPK, {
            type: 'FK',
            field: 'user',
            resourceType: 'user'
        }]
    });

    const userResourceType = new ResourceType({
        name: 'user',
        schema: [
            commonPK, {
                type: 'FK',
                field: 'branch',
                resourceType: branchResourceType.name
            }, {
                type: 'MANY',
                field: 'bookings',
                resourceType: bookingResourceType.name
            }
        ]
    });

    const store = new Store();

    store.mapRecord = jest.fn(store.mapRecord);

    store.registerRecordType(branchResourceType);
    store.registerRecordType(userResourceType);
    store.registerRecordType(bookingResourceType);

    const testUser = {
        _id: 1,
        username: 'user'
    };

    const testData = {
        ...testUser,
        branch: {
            _id: 56,
            branchName: 'branch'
        },
        bookings: [{
            _id: 1,
            date: '1970-01-01',
            time: '01:00'
        }, {
            _id: 2,
            date: '1970-01-02',
            time: '16:30'
        }]
    };
    describe('instance', () => {
        beforeAll(() => {
            store.dataMapping(userResourceType, testData);
        });

        it('store mapRecord toBeCalled', () => {
            expect(store.mapRecord).toBeCalledWith(branchResourceType, testData.branch);
        });

        it('dataMapping', () => {
            expect.assertions(4);
            const storedBranch = store.findRecordByKey(branchResourceType, testData.branch._id);
            const storeUser = store.findRecordByKey(userResourceType, testData._id);

            const bookingTable = store.getRecordTable(bookingResourceType);

            expect(storedBranch).toEqual(testData.branch);
            expect(storeUser).toEqual(testUser);

            bookingTable.recordMap.forEach((booking, encodedKey) => {
                const testBooking = testData.bookings.find(o => RecordTable.encodeKey(o._id) === encodedKey);
                expect(booking).toEqual(testBooking);
            });
        });
    });
});