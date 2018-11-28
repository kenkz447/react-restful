/**
 * Store is where data is stored from the API.
 */
import { RecordTable, Record } from './RecordTable';
import { ResourceType } from './ResourceType';
export interface RecordTables {
    [key: string]: RecordTable<{}>;
}
export interface SubscribeEvent<T> {
    type: 'mapping' | 'remove';
    resourceType: ResourceType<T>;
    value: T | Array<T>;
}
declare type findRecordPredicate<T> = (this: void, value: T, index: number, array: T[]) => boolean;
declare type SubscribeCallback<T> = (event: SubscribeEvent<T>) => void;
export declare class Store {
    private resourceTypes;
    private recordTables;
    private subscribeStacks;
    constructor();
    subscribe<T>(resourceTypes: ResourceType<{}>[], callback: SubscribeCallback<T>): () => void;
    unSubscribe(subscribeId: Symbol): void;
    resourceTypeHasRegistered(resourceTypeName: string): boolean;
    getRegisteredResourceType(resourceTypeName: string): ResourceType<{}>;
    getRecordTable<T>(resourceType: ResourceType<T>): RecordTable<T>;
    registerResourceType<T>(resourceType: ResourceType<T>): void;
    mapRecord<T>(resourceType: ResourceType<T>, record: T): boolean;
    mapRecords<T>(resourceType: ResourceType<T>, records: Array<T>): void;
    removeRecord<T>(resourceType: ResourceType<T>, record: T): boolean;
    findRecordByKey<T extends Record>(resourceType: ResourceType<T>, key: string | number): T | null;
    findOneRecord<T extends Record>(resourceType: ResourceType<T>, specs: findRecordPredicate<T> | T | string | number): T | null;
    findManyRecords: <T extends Record>(resourceType: ResourceType<T>, predicate: findRecordPredicate<T>) => T[];
    dataMapping<T>(resourceType: ResourceType<T>, data: T | Array<T>): void;
    private doSubcribleCallbacks;
}
export {};
