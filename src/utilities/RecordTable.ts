export type findRecordPredicate<T> = (value: T, index: number, recordMap: Array<T>) => boolean;

export type Record = {};

export class RecordTable<T> {
    keyProperty: string;
    recordMap: Map<string | number, T>;
    get records() {
        const recordValue = this.recordMap.values();
        return Array.from(recordValue);
    }

    constructor(keyProperty: string) {
        this.keyProperty = keyProperty;
        this.recordMap = new Map();
    }

    findByKey(key: string | number) {
        const result = this.recordMap.get(key);
        return result || null;
    }

    upsert(record: T) {
        const recordKey = record[this.keyProperty];
        this.recordMap.set(recordKey, record);
        return true;
    }

    remove(record: T) {
        const recordKey = record[this.keyProperty];
        this.recordMap.delete(recordKey);
    }
}