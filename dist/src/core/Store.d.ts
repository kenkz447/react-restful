/**
 * Store is where data is stored from the API.
 */
import { RecordTable, Record } from './RecordTable';
import { ResourceType } from './ResourceType';
export interface RecordTables {
    [key: string]: RecordTable<any>;
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
    subscribe: (resourceTypes: ResourceType<any>[], callback: SubscribeCallback<any>) => () => void;
    unSubscribe: (subscribeId: Symbol) => void;
    resourceTypeHasRegistered: (resourceTypeName: string) => boolean;
    getRegisteredResourceType: (resourceTypeName: string) => ResourceType<{}>;
    getTable: <T>(resourceType: ResourceType<T>) => RecordTable<T>;
    registerResourceType: <T>(resourceType: ResourceType<T>) => void;
    removeOne: <T>(resourceType: ResourceType<T>, record: T) => boolean;
    findOne: <T extends Record>(resourceType: ResourceType<T>, specs: string | number | T | findRecordPredicate<T>) => T | null;
    findMany: <T extends Record>(resourceType: ResourceType<T>, predicate: findRecordPredicate<T>) => T[];
    dataMapping: <T>(resourceType: ResourceType<T>, data: T | T[]) => undefined;
    private findRecordByKey;
    private mapRecords;
    private mapRecord;
    private doSubcribleCallbacks;
}
export {};
