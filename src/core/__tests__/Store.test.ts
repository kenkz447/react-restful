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

    let table: RecordTable<User>;
    const testUser: User = {
        id: 1,
        name: 'test'
    };

    describe('instance', () => {
        it('register record type', () => {
            store.registerResourceType(userResourceType);
            table = store.getTable(userResourceType);
            const registeredResourceType = store.getRegisteredResourceType(userResourceType.props.name);

            expect(table instanceof RecordTable).toBe(true);
            expect(registeredResourceType).toBe(userResourceType);
        });

        it('map record to table', () => {
            store.dataMapping(userResourceType, testUser);
            const storedUser = store.findOne(userResourceType, testUser.id);
            expect(storedUser).toEqual(testUser);
        });

        it('find one record by predicate', () => {
            const storedUser = store.findOne(userResourceType, (user) => {
                return user.name.includes('tes');
            });
            expect(storedUser).toEqual(testUser);
        });

        it('find many records', () => {
            const storedUser = store.findMany(userResourceType, (user) => {
                return user.name.includes('tes');
            });
            expect(storedUser).toEqual([testUser]);
        });

        it('remove record from table', () => {
            const removeResult = store.removeOne(userResourceType, testUser);
            const storedUser = store.findOne(userResourceType, testUser.id);

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