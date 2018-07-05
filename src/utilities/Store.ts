import { findRecordPredicate, RecordTable, RecordType } from './RecordTable';
import { ResourceType } from './ResourceType';

export interface RecordTables {
    [key: string]: RecordTable<{}>;
}

interface SubscribeEvent<T extends RecordType = RecordType> {
    type: 'mapping' | 'remove';
    resourceType: ResourceType<T>;
    record: T;
}

type subscribeCallback = (event: SubscribeEvent) => void;

interface SubscribeStack {
    resourceTypes: ResourceType[];
    callback: subscribeCallback;
}

export class Store {
    private recordTypes: Array<ResourceType>;
    private recordTables: RecordTables;
    private subscribeStacks: Array<SubscribeStack>;

    constructor() {
        this.recordTypes = [];
        this.recordTables = {};
        this.subscribeStacks = [];
    }

    subscribe(resourceTypes: ResourceType[], callback: subscribeCallback) {
        this.subscribeStacks.push({
            resourceTypes: resourceTypes,
            callback: callback
        });
    }

    getRegisteredResourceType(resourceTypeName: string) {
        const resourceType = this.recordTypes.find(o => o.name === resourceTypeName);
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

        this.recordTypes.push(resourceType);
    }

    mapRecord<T extends RecordType>(resourceType: ResourceType, record: T) {

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

    findOneRecord<T extends RecordType>(resourceType: ResourceType<T>, specs: findRecordPredicate<T>): T | null {
        const table = this.getRecordTable<T>(resourceType);
        return table.records.find(specs) || null;
    }

    /**
     * Map a fetched data of type to store
     * * For FK, we only update primitive fields of FK record
     */
    dataMapping<T extends RecordType>(resourceType: ResourceType, record: T) {
        const recordToMapping = Object.assign({}, record) as T;

        for (const schemaField of resourceType.schema) {
            const resourceTypeName = schemaField.resourceType as string;
            const relatedField = recordToMapping[schemaField.field] as {};

            if (!relatedField) {
                continue;
            }

            switch (schemaField.type) {
                case 'FK':
                    const fkResourceType = this.getRegisteredResourceType(resourceTypeName);
                    this.dataMapping(fkResourceType, relatedField);
                    // delete recordToMapping[schemaField.field];
                    break;
                case 'MANY':
                    if (!Array.isArray(relatedField)) {
                        throw new Error('MANY related but received something is not an array!');
                    }
                    const manyResourceType = this.getRegisteredResourceType(resourceTypeName);
                    for (const relatedRecord of relatedField) {
                        this.dataMapping(manyResourceType, relatedRecord);
                    }
                    // delete recordToMapping[schemaField.field];
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