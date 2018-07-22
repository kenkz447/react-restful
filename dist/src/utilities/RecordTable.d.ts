declare type RecordTypeValue = string | number | boolean | {};
export declare type findRecordPredicate<T> = (value: T, index: number, recordMap: Array<T>) => boolean;
export interface RecordType {
    [key: string]: RecordTypeValue;
}
export declare class RecordTable<T> {
    keyProperty: keyof RecordType;
    recordMap: Map<string, T>;
    readonly records: T[];
    static encodeKey(keyPropertyValue: RecordTypeValue): string;
    constructor(keyProperty: string);
    findByKey(key: string | number): T | null;
    upsert(record: T): boolean;
    remove(record: T): void;
}
export {};
