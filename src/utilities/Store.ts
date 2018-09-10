import { findRecordPredicate, RecordTable, RecordType } from './RecordTable';
import { ResourceType } from './ResourceType';

import uuid from 'uuid/v1';

export interface RecordTables {
    [key: string]: RecordTable<{}>;
}

export interface SubscribeEvent<T extends RecordType = RecordType> {
    type: 'mapping' | 'remove';
    resourceType: ResourceType<T>;
    record: T;
}

type SubscribeCallback<T> = (event: SubscribeEvent<T>) => void;

interface SubscribeStack<T> {
    resourceTypes: ResourceType[];
    callback: SubscribeCallback<T>;
    subscribeId: string;
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
        const subscribeId = uuid();
        this.subscribeStacks.push({
            resourceTypes: resourceTypes,
            callback: callback,
            subscribeId: subscribeId
        });
        return subscribeId;
    }

    unSubscribe(subscribeId: string) {
        return this.subscribeStacks.filter(o => o.subscribeId !== subscribeId);
    }

    getRegisteredResourceType(resourceTypeName: string): ResourceType<{}> {
        const resourceType = this.resourceTypes.find(o => o.name === resourceTypeName);
        if (!resourceType) {
            throw new Error(`Not found any resource type with name ${resourceTypeName}!`);
        }
        return resourceType;
    }

    getRecordTable<T = RecordType>(resourceType: ResourceType) {
        return this.recordTables[resourceType.name] as RecordTable<T>;
    }

    registerRecordType(resourceType: ResourceType) {
        if (this.recordTables[resourceType.name]) {
            return;
        }
        const recordKeyProperty = resourceType.schema.find(o => o.type === 'PK');
        if (recordKeyProperty === undefined) {
            throw new Error(`${resourceType.name} has no PK field!`);
        }
        const newRecordTable = new RecordTable(recordKeyProperty.field);

        this.recordTables[resourceType.name] = newRecordTable;

        this.resourceTypes.push(resourceType);
    }

    mapRecord<T extends RecordType>(resourceType: ResourceType, record: T) {
        const table = this.recordTables[resourceType.name];

        const upsertResult = table.upsert(record);

        // TODO: map orther related records

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

    removeRecord(resourceType: ResourceType, record: RecordType) {
        const table = this.recordTables[resourceType.name];
        table.remove(record);
        this.doSubcribleCallbacks({
            type: 'remove',
            resourceType: resourceType,
            record: record
        });
        return true;
    }

    findRecordByKey<T extends RecordType>(resourceType: ResourceType<T>, key: string | number) {
        const table = this.getRecordTable<T>(resourceType);
        const resultByKey = table.findByKey(key);
        return resultByKey;
    }

    findOneRecord<T extends RecordType>(resourceType: ResourceType<T>, specs: T): T | null;
    findOneRecord<T extends RecordType>(resourceType: ResourceType<T>, specs: string): T | null;
    findOneRecord<T extends RecordType>(resourceType: ResourceType<T>, specs: number): T | null;
    findOneRecord<T extends RecordType>(resourceType: ResourceType<T>, specs: findRecordPredicate<T>): T | null;
    findOneRecord<T extends RecordType>(
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

    /**
     * Map a fetched data of type to store
     * * For FK, we only update primitive fields of FK record
     */
    dataMapping<T extends RecordType>(resourceType: ResourceType, record: T) {
        const recordToMapping = Object.assign({}, record) as T;
        const recordKey = resourceType.getRecordKey(record);

        for (const schemaField of resourceType.schema) {
            const resourceTypeName = schemaField.resourceType as string;

            switch (schemaField.type) {
                case 'FK':
                    let fkValue = recordToMapping[schemaField.field];
                    const fkIsObject = (typeof fkValue === 'object');
                    if (!fkIsObject) {
                        continue;
                    }

                    const fkResourceType = this.getRegisteredResourceType(resourceTypeName);

                    // We need update MANY field FKResource
                    const fkValueKey = fkResourceType.getRecordKey(fkValue);
                    const tryGetFKObjectFormStore = this.findRecordByKey(fkResourceType, fkValueKey);
                    if (tryGetFKObjectFormStore) {
                        fkValue = tryGetFKObjectFormStore;
                    }
                    const fkChildSchemaField = fkResourceType.getChildTypeSchemafield(resourceType);
                    if (fkValue[fkChildSchemaField.field]) {
                        if (!fkValue[fkChildSchemaField.field].includes(recordKey)) {
                            fkValue[fkChildSchemaField.field].push(recordKey);
                        }
                    } else {
                        fkValue[fkChildSchemaField.field] = [recordKey];
                    }

                    this.dataMapping(fkResourceType, fkValue);
                    // Replace the original object with their id
                    recordToMapping[schemaField.field] = fkResourceType.getRecordKey(fkValue);
                    break;
                case 'MANY':
                    const childValue = recordToMapping[schemaField.field];
                    if (!childValue) {
                        continue;
                    }

                    if (!Array.isArray(childValue)) {
                        throw new Error('MANY related but received something is not an array!');
                    }

                    const childValueIsArrayObject = (typeof childValue[0] === 'object');
                    if (!childValueIsArrayObject) {
                        continue;
                    }

                    // TODO: We need update FK field of childResource to map with parent record

                    const childResourceType = this.getRegisteredResourceType(resourceTypeName);
                    for (const relatedRecord of childValue) {
                        this.dataMapping(childResourceType, relatedRecord);
                    }

                    // Replace the original object array with their ID array
                    recordToMapping[schemaField.field] = childValue.map((o: T) => childResourceType.getRecordKey(o));
                    break;
                default:
                    break;
            }
        }
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