import { RecordTable } from '../RecordTable';
import { ResourceType } from '../ResourceType';
import { Store } from '../Store';

describe('Store', () => {
    const store = new Store();
    
    const userResourceType = new ResourceType<{
        _id: number
        username: string
    }>({
        name: 'user',
        schema: [{
            field: '_id',
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

    describe('instance', () => {
        it('register record type', () => {
            store.registerRecordType(userResourceType);
            table = store.getRecordTable(userResourceType);
            const registeredResourceType = store.getRegisteredResourceType(userResourceType.name);
            
            expect(table instanceof RecordTable).toBe(true);
            expect(registeredResourceType).toBe(userResourceType);
        });

        it('map record to table', () => {
            const mappingResult = store.mapRecord(userResourceType, testUser);
            expect(mappingResult).toBe(true);
        });

        it('find one record by key', () => {
            const storedUser = store.findRecordByKey(userResourceType, testUser._id);
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
            const storedUser = store.findRecordByKey(userResourceType, testUser._id);

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