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
    getRecordTable: <T>(resourceType: ResourceType<T>) => RecordTable<T>;
    registerResourceType: <T>(resourceType: ResourceType<T>) => void;
    removeRecord: <T>(resourceType: ResourceType<T>, record: T) => boolean;
    findRecordByKey: <T extends Record>(resourceType: ResourceType<T>, key: string | number) => T | null;
    findOneRecord: <T extends Record>(resourceType: ResourceType<T>, specs: string | number | T | findRecordPredicate<T>) => T | null;
    findManyRecords: <T extends Record>(resourceType: ResourceType<T>, predicate: findRecordPredicate<T>) => T[];
    dataMapping: <T>(resourceType: ResourceType<T>, data: T | T[]) => undefined;
    private mapRecords;
    private mapRecord;
    private doSubcribleCallbacks;
}
export {};
