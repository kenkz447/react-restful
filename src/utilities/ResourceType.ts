/**
 * ResourceType
 * Defines the general data structure for a set of Resources.
 */

import { RecordTable } from './RecordTable';
import { Store } from './Store';
import { storeSymbol } from './setupEnvironment';

interface ResourceTypeProps<T> {
    name: string;
    keyProperty?: string;
    store?: Store;
    getRecordKey?: (record: T) => string | number | null;
}

export class ResourceType<T> {
    // tslint:disable-next-line:no-any
    static unRegisterTypes: ResourceType<any>[] = [];

    readonly props: ResourceTypeProps<T>;

    constructor(props: ResourceTypeProps<T> | string) {
        if (typeof props === 'string') {
            this.props = {
                name: props,
                keyProperty: 'id'
            };

            this.registerToStore();
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
        const { getRecordKey, keyProperty } = this.props;
        if (getRecordKey) {
            return getRecordKey(record);
        }

        return record[keyProperty!] || null;
    }
}