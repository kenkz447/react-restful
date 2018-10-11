/**
 * @module RecordTable
 * The same structure of data will be stored in a RecordTable
 */
import { ResourceType } from './ResourceType';
export declare type Record = {};
interface RecordTableProps<T> {
    resourceType: ResourceType<T>;
}
export declare class RecordTable<T extends Record> {
    props: RecordTableProps<T>;
    recordMap: Map<string | number, T>;
    readonly records: T[];
    constructor(props: RecordTableProps<T>);
    findByKey(key: string | number): T | null;
    upsert(record: T): boolean;
    remove(record: T): void;
}
export {};
