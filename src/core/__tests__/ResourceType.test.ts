import { ResourceType } from '../ResourceType';
import { Store } from '../Store';
import { User } from '../../test-resources';

describe('ResourceType', () => {
    const restfulStore = new Store();

    const userResourceType = new ResourceType<User>({
        store: restfulStore,
        name: 'user'
    });

    restfulStore.dataMapping = jest.fn(restfulStore.dataMapping);

    const testUser: User = {
        id: 1,
        name: 'user'
    };

    describe('instance', () => {
        beforeAll(() => {
            restfulStore.dataMapping(userResourceType, testUser);
        });

        it('map relateds record to store', () => {
            const storeUser = restfulStore.findOne(userResourceType, testUser.id);
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