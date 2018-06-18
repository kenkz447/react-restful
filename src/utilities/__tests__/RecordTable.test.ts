import { RecordTable } from '../RecordTable';
interface User {
    _id: number;
    username: string;
}

describe('RecordTable', () => {
    const table = new RecordTable<User>();

    let testUser: User = {
        _id: 1,
        username: 'test'
    };

    it('add a record', () => {
        table.upsert(testUser);
        expect(table.findByKey(testUser._id)).toBe(testUser);
    });

    it('update the record', () => {
        testUser = {
            _id: 1,
            username: 'username has been changed'
        };
        table.upsert(testUser);
        expect(table.findByKey(testUser._id)).toBe(testUser);
    });

    it('get the record by `primary_key(id)`', () => {
        const recordGetByKey = table.findByKey(testUser._id);
        expect(recordGetByKey).toBe(testUser);
    });

    it('find the record by predicate', () => {
        const foundedRecord = table.records.find((record) => {
            console.log(record)
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