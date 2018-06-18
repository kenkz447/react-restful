import { findPredicate, RecordTable, RecordType } from './RecordTable';
import { ResourceType } from './ResourceType';

export interface RecordTables {
    [key: string]: RecordTable<{}>;
}

interface SubscribeEvent<T extends RecordType = RecordType> {
    type: 'mapping' | 'remove';
    resourceType: ResourceType;
    record: RecordType;
}

type findOnePredicate<T> = (value: T, index: number) => boolean;

type subscribeCallback = (event: SubscribeEvent) => void;

interface StoreProps {
    recordKeyProperty: string;
}

interface SubscribeStack {
    resourceTypes: ResourceType[];
    callback: subscribeCallback;
}

export interface FindRecordSpec {
    property: string;
    // tslint:disable-next-line:no-any
    value: any;
}

export class Store {
    private recordKeyProperty: string;
    private recordTables: RecordTables = {};
    private subscribeStacks: SubscribeStack[] = [];

    constructor(props: StoreProps) {
        this.recordKeyProperty = props.recordKeyProperty;
    }

    subscribe(resourceTypes: ResourceType[], callback: subscribeCallback) {
        this.subscribeStacks.push({
            resourceTypes: resourceTypes,
            callback: callback
        });
    }

    getRecordTable<T = RecordType>(resourceType: ResourceType) {
        return this.recordTables[resourceType.name] as RecordTable<T>;
    }

    registerRecordType(resourceType: ResourceType) {
        if (this.recordTables[resourceType.name]) {
            return;
        }
        const newRecordTable = new RecordTable(this.recordKeyProperty);
        this.recordTables[resourceType.name] = newRecordTable;
    }

    mapRecord(resourceType: ResourceType, record: RecordType) {
        const table = this.recordTables[resourceType.name];
        table.upsert(record);
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

    findOneRecord<T>(resourceType: ResourceType<T>, specs: FindRecordSpec[] | findPredicate<T>): T | undefined {
        const table = this.getRecordTable<T>(resourceType);
        if (Array.isArray(specs)) {
            for (const spec of specs) {
                if (spec.property === resourceType.keyProperty) {
                    const resultByKey = table.findByKey(spec.value);
                    if (resultByKey) {
                        return resultByKey;
                    }
                }
            }
        } else {
            return table.find(specs);
        }
    }

    private doSubcribleCallbacks(event: SubscribeEvent) {
        for (const subscribeStack of this.subscribeStacks) {
            if (subscribeStack.resourceTypes.includes(event.resourceType)) {
                subscribeStack.callback(event);
            }
        }
    }
}