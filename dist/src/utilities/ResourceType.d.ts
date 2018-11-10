/**
 * ResourceType
 * Defines the general data structure for a set of Resources.
 */
import { Record } from './RecordTable';
import { Store } from './Store';
interface ResourceTypeProps {
    name: string;
    keyProperty?: string;
    store?: Store;
}
export declare class ResourceType<T extends Record> {
    readonly props: ResourceTypeProps;
    constructor(props: ResourceTypeProps | string);
    getAllRecords(store: Store, predicate?: (record: T) => boolean): T[];
    getRecordKey(record: T): any;
}
export {};
