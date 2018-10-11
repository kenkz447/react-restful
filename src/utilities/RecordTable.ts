/**
 * @module RecordTable
 * The same structure of data will be stored in a RecordTable
 */

import { ResourceType } from './ResourceType';

export type Record = {};

interface RecordTableProps<T> {
    resourceType: ResourceType<T>;
}

export class RecordTable<T extends Record> {
    props: RecordTableProps<T>;
    recordMap: Map<string | number, T>;
    get records() {
        const recordValue = this.recordMap.values();
        return Array.from(recordValue);
    }

    constructor(props: RecordTableProps<T>) {
        this.props = props;
        this.recordMap = new Map();
    }

    findByKey(key: string | number) {
        const result = this.recordMap.get(key);
        return result || null;
    }

    upsert(record: T) {
        const { resourceType } = this.props;
        const recordKey = resourceType.getRecordKey(record);
        this.recordMap.set(recordKey, record);
        return true;
    }

    remove(record: T) {
        const { resourceType } = this.props;
        const recordKey = resourceType.getRecordKey(record);
        this.recordMap.delete(recordKey);
    }
}