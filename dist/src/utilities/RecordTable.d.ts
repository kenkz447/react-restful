export declare type findRecordPredicate<T> = (value: T, index: number, recordMap: Array<T>) => boolean;
export declare type RecordType = {};
export declare class RecordTable<T> {
    keyProperty: string;
    recordMap: Map<string, T>;
    readonly records: T[];
    static encodeKey(keyPropertyValue: string | number): string;
    constructor(keyProperty: string);
    findByKey(key: string | number): T | null;
    upsert(record: T): boolean;
    remove(record: T): void;
}
