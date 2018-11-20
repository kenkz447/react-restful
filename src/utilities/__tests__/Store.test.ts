import { RecordTable } from '../RecordTable';
import { Store } from '../Store';
import { userResourceType, User } from '../../test-resources';

describe('Store', () => {
    const store = new Store();

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
    const testUser: User = {
        id: 1,
        name: 'test'
    };

    describe('instance', () => {
        it('register record type', () => {
            store.registerRecord(userResourceType);
            table = store.getRecordTable(userResourceType);
            const registeredResourceType = store.getRegisteredResourceType(userResourceType.props.name);

            expect(table instanceof RecordTable).toBe(true);
            expect(registeredResourceType).toBe(userResourceType);
        });

        it('map record to table', () => {
            const mappingResult = store.mapRecord(userResourceType, testUser);
            expect(mappingResult).toBe(true);
        });

        it('find one record by key', () => {
            const storedUser = store.findRecordByKey(userResourceType, testUser.id);
            expect(storedUser).toEqual(testUser);
        });

        it('find one record by predicate', () => {
            const storedUser = store.findOneRecord(userResourceType, (user) => {
                return user.name.includes('tes');
            });
            expect(storedUser).toEqual(testUser);
        });

        it('find many records', () => {
            const storedUser = store.findManyRecords(userResourceType, (user) => {
                return user.name.includes('tes');
            });
            expect(storedUser).toEqual([testUser]);
        });

        it('remove record from table', () => {
            const removeResult = store.removeRecord(userResourceType, testUser);
            const storedUser = store.findRecordByKey(userResourceType, testUser.id);

            expect(removeResult).toBe(true);
            expect(storedUser).toBe(null);
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