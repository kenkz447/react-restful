/**
 * Store is where data is stored from the API.
 */
import { RecordTable, Record } from './RecordTable';
import { ResourceType } from './ResourceType';
export interface RecordTables {
    [key: string]: RecordTable<{}>;
}
export interface SubscribeEvent<T extends Record = Record> {
    type: 'mapping' | 'remove';
    resourceType: ResourceType<T>;
    record: T;
}
declare type findRecordPredicate<T extends Record> = (value: T, index: number, recordMap: Array<T>) => boolean;
declare type SubscribeCallback<T> = (event: SubscribeEvent<T>) => void;
export declare class Store {
    private resourceTypes;
    private recordTables;
    private subscribeStacks;
    constructor();
    subscribe<T>(resourceTypes: ResourceType[], callback: SubscribeCallback<T>): () => void;
    unSubscribe(subscribeId: Symbol): void;
    resourceTypeHasRegistered(resourceTypeName: string): boolean;
    getRegisteredResourceType(resourceTypeName: string): ResourceType<{}>;
    getRecordTable<T extends Record = Record>(resourceType: ResourceType<T>): RecordTable<T>;
    registerRecord<T extends Record = Record>(resourceType: ResourceType<T>): void;
    mapRecord<T extends Record>(resourceType: ResourceType, record: T): boolean;
    removeRecord(resourceType: ResourceType, record: Record): boolean;
    findRecordByKey<T extends Record>(resourceType: ResourceType<T>, key: string | number): T | null;
    findOneRecord<T extends Record>(resourceType: ResourceType<T>, specs: findRecordPredicate<T> | T | string | number): T | null;
    /**
     * Map a fetched data of type to store
     * * For FK, we only update primitive fields of FK record
     */
    dataMapping<T extends Record>(resourceType: ResourceType, record: T): void;
    private doSubcribleCallbacks;
}
export {};
