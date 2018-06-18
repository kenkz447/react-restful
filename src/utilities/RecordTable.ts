import { Base64 } from 'js-base64';

interface Table<T> {
    [key: string]: T;
}

type RecordTypeValue = string | number | boolean;

export type findPredicate<T> = (value: T, index: number, recordMap: Array<T>) => boolean;

export interface RecordType {
    [key: string]: RecordTypeValue;
}

export class RecordTable<T> {
    keyProperty: keyof RecordType;
    recordMap: Map<string, T>;
    get records() {
        const recordValue = this.recordMap.values();
        return Array.from(recordValue);
    }

    static encodeKey(keyPropertyValue: RecordTypeValue) {
        const encoded = Base64.encode(String(keyPropertyValue));
        return encoded;
    }

    constructor(keyProperty: string = 'id') {
        this.keyProperty = keyProperty;
        this.recordMap = new Map();
    }

    find(predicate: findPredicate<T>): T | undefined {
        return this.records.find(predicate);
    }

    findByKey(key: string | number) {
        const encoded = RecordTable.encodeKey(key);
        return this.recordMap.get(encoded);
    }

    upsert(record: T) {
        const keyPropertyValue = record[this.keyProperty];
        const encoded = RecordTable.encodeKey(keyPropertyValue);
        this.recordMap.set(encoded, record);
    }

    remove(record: T) {
        const keyPropertyValue = record[this.keyProperty];
        const encoded = RecordTable.encodeKey(keyPropertyValue);
        this.recordMap.delete(encoded);
    }
}