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

type findRecordPredicate<T extends Record> = (value: T, index: number, recordMap: Array<T>) => boolean;

type SubscribeCallback<T> = (event: SubscribeEvent<T>) => void;

interface SubscribeStack<T> {
    resourceTypes: ResourceType[];
    callback: SubscribeCallback<T>;
    subscribeId: Symbol;
}

export class Store {
    private resourceTypes: Array<ResourceType>;
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

    subscribe<T>(resourceTypes: ResourceType[], callback: SubscribeCallback<T>) {
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
        const found = this.resourceTypes.find(o => o.name === resourceTypeName);
        return found !== undefined;
    }

    getRegisteredResourceType(resourceTypeName: string): ResourceType<{}> {
        const resourceType = this.resourceTypes.find(o => o.name === resourceTypeName);
        if (!resourceType) {
            throw new Error(`Not found any resource type with name ${resourceTypeName}!`);
        }

        return resourceType;
    }

    getRecordTable<T extends Record = Record>(resourceType: ResourceType<T>) {
        return this.recordTables[resourceType.name] as RecordTable<T>;
    }

    registerRecord<T extends Record = Record>(resourceType: ResourceType<T>) {
        if (this.recordTables[resourceType.name]) {
            return;
        }

        const newRecordTable = new RecordTable({
            resourceType: resourceType
        });

        this.recordTables[resourceType.name] = newRecordTable;

        this.resourceTypes.push(resourceType);
    }

    mapRecord<T extends Record>(resourceType: ResourceType, record: T) {
        const table = this.recordTables[resourceType.name];

        const upsertResult = table.upsert(record);

        if (!upsertResult) {
            throw new Error('upsert not working!');
        }

        this.doSubcribleCallbacks({
            type: 'mapping',
            resourceType: resourceType,
            record: record
        });

        return true;
    }

    removeRecord(resourceType: ResourceType, record: Record) {
        const table = this.recordTables[resourceType.name];
        table.remove(record);
        this.doSubcribleCallbacks({
            type: 'remove',
            resourceType: resourceType,
            record: record
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

    dataMapping<T extends Record>(resourceType: ResourceType, record: T) {
        const recordToMapping = Object.assign({}, record);
        this.mapRecord(resourceType, recordToMapping);
    }

    private doSubcribleCallbacks(event: SubscribeEvent) {
        for (const subscribeStack of this.subscribeStacks) {
            if (subscribeStack.resourceTypes.includes(event.resourceType)) {
                subscribeStack.callback(event);
            }
        }
    }
}