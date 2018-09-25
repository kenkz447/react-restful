import { RecordTable } from '../RecordTable';
import { ResourceType, SchemaField } from '../ResourceType';
import { Store } from '../Store';
import { User } from '../../test-resources';

describe('ResourceType', () => {
    const restfulStore = new Store();

    const userResourceType = new ResourceType({
        store: restfulStore,
        name: 'user',
        schema: [{
            field: 'id',
            type: 'PK'
        }]
    });

    restfulStore.mapRecord = jest.fn(restfulStore.mapRecord);

    const testUser: User = {
        id: 1,
        name: 'user'
    };

    describe('instance', () => {
        beforeAll(() => {
            restfulStore.mapRecord(userResourceType, testUser);
        });

        it('map relateds record to store', () => {
            const storeUser = restfulStore.findRecordByKey(userResourceType, testUser.id);
            expect(storeUser).toEqual(testUser);
        });

        it('getAllRecords', () => {
            let storedUsers = userResourceType.getAllRecords(restfulStore);
            expect(storedUsers).toEqual([testUser]);

            storedUsers = userResourceType.getAllRecords(restfulStore, (o: User) => o.id === testUser.id);
            expect(storedUsers).toEqual([testUser]);
        });
    });
});