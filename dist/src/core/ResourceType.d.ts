/**
 * ResourceType
 * Defines the general data structure for a set of Resources.
 */
import { Store } from './Store';
interface ResourceTypeProps<T> {
    name: string;
    keyProperty?: string;
    store?: Store;
    getRecordKey?: (record: T) => string | number | null;
}
export declare class ResourceType<T> {
    static unRegisterTypes: ResourceType<any>[];
    readonly props: ResourceTypeProps<T>;
    constructor(props: ResourceTypeProps<T> | string);
    registerToStore: (store?: Store | undefined) => void;
    getAllRecords(store: Store, predicate?: (record: T) => boolean): T[];
    getRecordKey(record: T): any;
}
export {};
