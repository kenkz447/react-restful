/**
 * ResourceType
 * Defines the general data structure for a set of Resources.
 */

import { Record, RecordTable } from './RecordTable';
import { Store } from './Store';

interface ResourceTypeProps {
    name: string;
    keyProperty?: string;
    store?: Store;
}

export class ResourceType<T extends Record> {
    readonly props: ResourceTypeProps;

    constructor(props: ResourceTypeProps | string) {
        if (typeof props === 'string') {
            this.props = {
                name: props,
                keyProperty: 'id'
            };
        } else {
            const { store } = props;
            this.props = { 
                keyProperty: 'id',
                ...props 
            };
            if (store) {
                store.registerRecord(this);
            }
        }
    }

    getAllRecords(store: Store, predicate?: (record: T) => boolean) {
        const { getRecordTable } = store;
        const recordTable: RecordTable<T> = getRecordTable(this);
        const result = predicate ? recordTable.records.filter(predicate) : recordTable.records;
        return result;
    }

    getRecordKey(record: T) {
        return record[this.props.keyProperty!] || null;
    }
}