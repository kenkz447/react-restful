import { Base64 } from 'js-base64';

interface Table<T> {
    [key: string]: T;
}

export interface Record {
    [key: string]: string | number | boolean;
}

export class RecordTable<T = Record> {
    keyProperty: keyof Record;

    table: Table<T> = {};

    static encodedRecordKeyValue(keyPropertyValue: string) {
        const encoded = Base64.encode(keyPropertyValue);
        return encoded;
    }

    constructor(keyProperty: string) {
        this.keyProperty = keyProperty;
    }

    upsert(record: T) {
        const keyPropertyValue = record[this.keyProperty];
        const encoded = RecordTable.encodedRecordKeyValue(keyPropertyValue);
        this.table[encoded] = record;
    }

    remove(record: T) {
        const keyPropertyValue = record[this.keyProperty];
        const encoded = RecordTable.encodedRecordKeyValue(keyPropertyValue);
        delete this.table[encoded];
    }
}
