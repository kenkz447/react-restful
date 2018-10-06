export declare type findRecordPredicate<T> = (value: T, index: number, recordMap: Array<T>) => boolean;
export declare type Record = {};
export declare class RecordTable<T> {
    keyProperty: string;
    recordMap: Map<string | number, T>;
    readonly records: T[];
    constructor(keyProperty: string);
    findByKey(key: string | number): T | null;
    upsert(record: T): boolean;
    remove(record: T): void;
}
