import { RecordTable } from '../RecordTable';
interface User {
    _id: number;
    username: string;
}

describe('RecordTable', () => {
    const table = new RecordTable<User>('_id');

    let testUser: User = {
        _id: 1,
        username: 'test'
    };

    it('add a record', () => {
        const added = table.upsert(testUser);
        expect(added).toBe(true);
    });

    it('update the record', () => {
        testUser = {
            _id: 1,
            username: 'username has been changed'
        };
        const updateResult = table.upsert(testUser);
        expect(updateResult).toBe(true);
    });

    it('get the record by `primary_key(id)`', () => {
        const recordGetByKey = table.findByKey(testUser._id);
        expect(recordGetByKey).toBe(testUser);
    });

    it('find the record by predicate', () => {
        const foundedRecord = table.records.find((record) => {
           return record.username.includes('changed');
        });
        expect(foundedRecord).toBe(testUser);
    });

    it('remove the record', () => {
        table.remove(testUser);
        const recordGetByKey = table.findByKey(testUser._id);
        expect(recordGetByKey).toBe(undefined);
    });
});