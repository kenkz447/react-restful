import { RecordTable } from '../RecordTable';
import { ResourceType } from '../ResourceType';
import { FindRecordSpec, Store } from '../Store';

describe('Store', () => {
    const store = new Store({
        recordKeyProperty: '_id'
    });
    const userResourceType = new ResourceType<{
        _id: number
        username: string
    }>({
        name: 'user',
        schema: [{
            property: '_id',
            type: 'PK',
        }]
    });
    const mappingCallback = jest.fn();
    const removeCallback = jest.fn();

    store.subscribe([userResourceType], (event) => {
        if (event.type === 'mapping') {
            mappingCallback(event);
        } else {
            removeCallback(event);
        }
    });

    let table: RecordTable<{}>;
    const testUser = {
        _id: 1,
        username: 'test'
    };

    const findUserByIdSpec: FindRecordSpec = {
        property: '_id',
        value: testUser._id
    };

    describe('instance', () => {
        it('register record type', () => {
            store.registerRecordType(userResourceType);
            table = store.getRecordTable(userResourceType);
            expect(table instanceof RecordTable).toBe(true);
        });

        it('map record to table', () => {
            const mappingResult = store.mapRecord(userResourceType, testUser);
            expect(mappingResult).toBe(true);
        });

        it('find one record by key', () => {
            const storedUser = store.findOneRecord(userResourceType, [findUserByIdSpec]);
            expect(storedUser).toEqual(testUser);
        });

        it('find one record by predicate', () => {
            const storedUser = store.findOneRecord(userResourceType, (user) => {
                return user.username.includes('tes');
            });
            expect(storedUser).toEqual(testUser);
        });

        it('remove record from table', () => {
            const removeResult = store.removeRecord(userResourceType, testUser);

            const storedUser = store.findOneRecord(userResourceType, [findUserByIdSpec]);
            expect(removeResult).toBe(true);
            expect(storedUser).toBe(undefined);
        });
    });

    describe('subscribe', () => {
        it('when some thing mapped to table', () => {
            expect(mappingCallback).toBeCalled();
        });

        it('when some thing remove from table', () => {
            expect(removeCallback).toBeCalled();
        });
    });
});