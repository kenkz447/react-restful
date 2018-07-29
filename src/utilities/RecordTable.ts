import { Base64 } from 'js-base64';

export type findRecordPredicate<T> = (value: T, index: number, recordMap: Array<T>) => boolean;

// tslint:disable-next-line:no-any
export type RecordType = {};

export class RecordTable<T> {
    keyProperty: string;
    recordMap: Map<string, T>;
    get records() {
        const recordValue = this.recordMap.values();
        return Array.from(recordValue);
    }

    static encodeKey(keyPropertyValue: string | number) {
        const encoded = Base64.encode(String(keyPropertyValue));
        return encoded;
    }

    constructor(keyProperty: string) {
        this.keyProperty = keyProperty;
        this.recordMap = new Map();
    }

    findByKey(key: string | number) {
        const encoded = RecordTable.encodeKey(key);
        const result = this.recordMap.get(encoded);
        return result || null;
    }

    upsert(record: T) {
        const keyPropertyValue = record[this.keyProperty];
        const encoded = RecordTable.encodeKey(keyPropertyValue);
        this.recordMap.set(encoded, record);
        return true;
    }

    remove(record: T) {
        const keyPropertyValue = record[this.keyProperty];
        const encoded = RecordTable.encodeKey(keyPropertyValue);
        this.recordMap.delete(encoded);
    }
}