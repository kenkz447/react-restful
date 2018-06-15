import { Base64 } from 'js-base64';

interface Table<T> {
    [key: string]: T;
}

export interface Record {
    [key: string]: string | number | boolean;
}

export class RecordTable<T = Record> {
    keyProperty: keyof Record;

    records: Table<T>;

    static encodeKey(keyPropertyValue: string | number) {
        const encoded = Base64.encode(String(keyPropertyValue));
        return encoded;
    }

    constructor(keyProperty: string = 'id') {
        this.keyProperty = keyProperty;
        this.records = {};
    }

    getByKey(key: string | number) {
        const encoded = RecordTable.encodeKey(key);
        return this.records[encoded];
    }

    upsert(record: T) {
        const keyPropertyValue = record[this.keyProperty];
        const encoded = RecordTable.encodeKey(keyPropertyValue);
        this.records[encoded] = record;
    }

    remove(record: T) {
        const keyPropertyValue = record[this.keyProperty];
        const encoded = RecordTable.encodeKey(keyPropertyValue);
        delete this.records[encoded];
    }
}