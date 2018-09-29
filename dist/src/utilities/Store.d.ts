import { findRecordPredicate, RecordTable, RecordType } from './RecordTable';
import { ResourceType } from './ResourceType';
export interface RecordTables {
    [key: string]: RecordTable<{}>;
}
export interface SubscribeEvent<T extends RecordType = RecordType> {
    type: 'mapping' | 'remove';
    resourceType: ResourceType<T>;
    record: T;
}
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
    getRecordTable<T = RecordType>(resourceType: ResourceType): RecordTable<T>;
    registerRecordType(resourceType: ResourceType): void;
    mapRecord<T extends RecordType>(resourceType: ResourceType, record: T): boolean;
    removeRecord(resourceType: ResourceType, record: RecordType): boolean;
    findRecordByKey<T extends RecordType>(resourceType: ResourceType<T>, key: string | number): T | null;
    findOneRecord<T extends RecordType>(resourceType: ResourceType<T>, specs: T): T | null;
    findOneRecord<T extends RecordType>(resourceType: ResourceType<T>, specs: string): T | null;
    findOneRecord<T extends RecordType>(resourceType: ResourceType<T>, specs: number): T | null;
    findOneRecord<T extends RecordType>(resourceType: ResourceType<T>, specs: findRecordPredicate<T>): T | null;
    /**
     * Map a fetched data of type to store
     * * For FK, we only update primitive fields of FK record
     */
    dataMapping<T extends RecordType>(resourceType: ResourceType, record: T): void;
    private doSubcribleCallbacks;
}
export {};
