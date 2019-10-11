import { RecordTable } from '../RecordTable';
import { User } from '../../test-resources';
import { ResourceType } from '../ResourceType';

describe('RecordTable', () => {
    const table = new RecordTable<User>({
        resourceType: new ResourceType('User')
    });

    let testUser: User = {
        id: 1,
        name: 'test'
    };

    it('add a record', () => {
        const added = table.upsert(testUser);
        expect(added).toBe(true);
    });

    it('update the record', () => {
        testUser = {
            id: 1,
            name: 'username has been changed'
        };
        const updateResult = table.upsert(testUser);
        expect(updateResult).toBe(true);
    });

    it('get the record by primary key(id)', () => {
        const recordGetByKey = table.findByKey(testUser.id);
        expect(recordGetByKey).toBe(testUser);
    });

    it('find the record by predicate', () => {
        const foundedRecord = table.records.find((record) => {
            return record.name.includes('changed');
        });
        expect(foundedRecord).toBe(testUser);
    });

    it('remove the record', () => {
        table.remove(testUser);
        const recordGetByKey = table.findByKey(testUser.id);
        expect(recordGetByKey).toBe(null);
    });
});