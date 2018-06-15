import { RecordTable } from '../RecordTable';

describe('RecordTable', () => {
    const table = new RecordTable();
    let record = {
        id: 1,
        username: 'test'
    };
    const encodeKey = RecordTable.encodeKey(1);

    it('add a record', () => {
        table.upsert(record);
        expect(table.records[encodeKey]).toBe(record);
    });

    it('update the record', () => {
        record = {
            id: 1,
            username: 'username has been changed'
        };
        table.upsert(record);
        expect(table.records[encodeKey]).toBe(record);
    });

    it('get the record by `primary_key(id)`', () => {
        const recordGetByKey = table.getByKey(record.id);
        expect(recordGetByKey).toBe(record);
    });

    it('remove the record', () => {
        table.remove(record);
        const recordGetByKey = table.getByKey(record.id);
        expect(recordGetByKey).toBe(undefined);
    });
});