import { RecordTable } from '../RecordTable';
import { ResourceType, SchemaField } from '../ResourceType';
import { Store } from '../Store';

describe('ResourceType', () => {
    const commonPK: SchemaField = {
        field: 'id',
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
        id: 1,
        username: 'user'
    };

    const testData = {
        ...testUser,
        branch: {
            id: 56,
            branchName: 'branch'
        },
        bookings: [{
            id: 1,
            date: '1970-01-01',
            time: '01:00',
            user: 1
        }, {
            id: 2,
            date: '1970-01-02',
            time: '16:30',
            user: 1
        }]
    };
    describe('instance', () => {
        beforeAll(() => {
            store.dataMapping(userResourceType, testData);
        });

        it('store mapRecord toBeCalled', () => {
            expect(store.mapRecord).toBeCalledWith(branchResourceType, testData.branch);
        });

        it('map relateds record to store', () => {
            expect.assertions(4);
            const storedBranch = store.findRecordByKey(branchResourceType, testData.branch.id);
            const storeUser = store.findRecordByKey(userResourceType, testData.id);

            const bookingTable = store.getRecordTable(bookingResourceType);

            expect(storedBranch).toEqual(testData.branch);
            expect(storeUser).toEqual({ 'id': 1, 'bookings': [1, 2], 'branch': 56, 'username': 'user' });

            bookingTable.recordMap.forEach((booking, encodedKey) => {
                const testBooking = testData.bookings.find(o => RecordTable.encodeKey(o.id) === encodedKey);
                expect(booking).toEqual(testBooking);
            });
        });

        it('retreive relateds record', () => {
            const allRecord = userResourceType.getAllRecords(store);
            expect(allRecord).toEqual([{
                'id': 1,
                'bookings': [
                    {
                        'id': 1,
                        'date': '1970-01-01',
                        'time': '01:00',
                        'user': { 'id': 1, 'bookings': [1, 2], 'branch': 56, 'username': 'user' }
                    },
                    {
                        'id': 2,
                        'date': '1970-01-02',
                        'time': '16:30',
                        'user': { 'id': 1, 'bookings': [1, 2], 'branch': 56, 'username': 'user' }
                    }],
                'branch': { 'id': 56, 'branchName': 'branch', 'users': [1] },
                'username': 'user'
            }]);
        });
    });
});