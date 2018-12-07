/**
 * Store is where data is stored from the API.
 */

import { RecordTable, Record } from './RecordTable';
import { ResourceType } from './ResourceType';

export interface RecordTables {
    // tslint:disable-next-line:no-any
    [key: string]: RecordTable<any>;
}

export interface SubscribeEvent<T> {
    type: 'mapping' | 'remove';
    resourceType: ResourceType<T>;
    value: T | Array<T>;
}

type findRecordPredicate<T> = (this: void, value: T, index: number, array: T[]) => boolean;

type SubscribeCallback<T> = (event: SubscribeEvent<T>) => void;

interface SubscribeStack<T> {
    resourceTypes: ResourceType<T>[];
    callback: SubscribeCallback<T>;
    subscribeId: Symbol;
}

export class Store {
    // tslint:disable-next-line:no-any
    private resourceTypes: Array<ResourceType<any>>;
    private recordTables: RecordTables;

    // tslint:disable-next-line:no-any
    private subscribeStacks: SubscribeStack<any>[];

    constructor() {
        this.resourceTypes = [];
        this.recordTables = {};
        this.subscribeStacks = [];

        this.subscribe = this.subscribe.bind(this);
        this.getRecordTable = this.getRecordTable.bind(this);
    }

    // tslint:disable-next-line:no-any
    subscribe(resourceTypes: ResourceType<any>[], callback: SubscribeCallback<any>) {
        const subscribeId = Symbol();
        this.subscribeStacks.push({
            resourceTypes: resourceTypes,
            callback: callback,
            subscribeId: subscribeId
        });
        return () => {
            this.unSubscribe(subscribeId);
        };
    }

    unSubscribe(subscribeId: Symbol) {
        this.subscribeStacks = this.subscribeStacks.filter(o => o.subscribeId !== subscribeId);
    }

    resourceTypeHasRegistered(resourceTypeName: string) {
        const found = this.resourceTypes.find(o => o.props.name === resourceTypeName);
        return found !== undefined;
    }

    getRegisteredResourceType(resourceTypeName: string): ResourceType<{}> {
        const resourceType = this.resourceTypes.find(o => o.props.name === resourceTypeName);
        if (!resourceType) {
            throw new Error(`Not found any resource type with name ${resourceTypeName}!`);
        }

        return resourceType;
    }

    getRecordTable<T>(resourceType: ResourceType<T>) {
        return this.recordTables[resourceType.props.name] as RecordTable<T>;
    }

    registerResourceType<T>(resourceType: ResourceType<T>) {
        if (this.recordTables[resourceType.props.name]) {
            return;
        }

        const newRecordTable = new RecordTable({
            resourceType: resourceType
        });

        this.recordTables[resourceType.props.name] = newRecordTable;

        this.resourceTypes.push(resourceType);
    }

    removeRecord<T>(resourceType: ResourceType<T>, record: T) {
        const table = this.recordTables[resourceType.props.name];
        table.remove(record);
        this.doSubcribleCallbacks({
            type: 'remove',
            resourceType: resourceType,
            value: record
        });
        return true;
    }

    findRecordByKey<T extends Record>(resourceType: ResourceType<T>, key: string | number) {
        const table = this.getRecordTable<T>(resourceType);
        const resultByKey = table.findByKey(key);
        return resultByKey;
    }

    findOneRecord<T extends Record>(
        resourceType: ResourceType<T>,
        specs: findRecordPredicate<T> | T | string | number): T | null {
        if (!specs) {
            return null;
        }

        const specsType = typeof specs;
        switch (specsType) {
            case 'string':
            case 'number':
                return this.findRecordByKey(resourceType, specs as string | number);
            case 'object':
                const recordKey = resourceType.getRecordKey(specs as T);
                return this.findRecordByKey(resourceType, recordKey);
            default:
                const table = this.getRecordTable<T>(resourceType);
                return table.records.find(specs as findRecordPredicate<T>) || null;
        }
    }

    findManyRecords = <T extends Record>(
        resourceType: ResourceType<T>,
        predicate: findRecordPredicate<T>
    ): T[] => {
        const table = this.getRecordTable<T>(resourceType);
        if (!table) {
            return [];
        }

        return table.records.filter(predicate);
    }

    dataMapping<T>(resourceType: ResourceType<T>, data: T | Array<T>) {
        if (Array.isArray(data)) {
            return void this.mapRecords(resourceType, data);
        }

        this.mapRecord(resourceType, data);
    }

    private mapRecords<T>(resourceType: ResourceType<T>, records: Array<T>) {
        const table = this.recordTables[resourceType.props.name];

        for (const record of records) {
            const upsertResult = table.upsert(record);
            if (upsertResult !== true) {
                throw new Error(upsertResult);
            }
        }

        this.doSubcribleCallbacks({
            type: 'mapping',
            resourceType: resourceType,
            value: records
        });
    }

    private mapRecord<T>(resourceType: ResourceType<T>, record: T) {
        const table = this.recordTables[resourceType.props.name];

        const upsertResult = table.upsert(record);

        if (upsertResult !== true) {
            throw new Error(upsertResult);
        }

        this.doSubcribleCallbacks({
            type: 'mapping',
            resourceType: resourceType,
            value: record
        });

        return true;
    }

    private doSubcribleCallbacks<T>(event: SubscribeEvent<T>) {
        for (const subscribeStack of this.subscribeStacks) {
            if (subscribeStack.resourceTypes.includes(event.resourceType)) {
                subscribeStack.callback(event);
            }
        }
    }
}