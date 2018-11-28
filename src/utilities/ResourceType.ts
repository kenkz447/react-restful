/**
 * ResourceType
 * Defines the general data structure for a set of Resources.
 */

import { Record, RecordTable } from './RecordTable';
import { Store } from './Store';
import { storeSymbol } from './setupEnvironment';

interface ResourceTypeProps {
    name: string;
    keyProperty?: string;
    store?: Store;
}

export class ResourceType<T extends Record> {
    static unRegisterTypes: ResourceType<{}>[] = [];

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

            this.registerToStore(store);
        }
    }

    registerToStore = (store?: Store): void => {
        if (store) {
            return void store.registerResourceType(this);
        }

        if (!global[storeSymbol]) {
            return void ResourceType.unRegisterTypes.push(this);
        }

        const globalStore = global[storeSymbol] as Store;
        return void globalStore.registerResourceType(this);
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