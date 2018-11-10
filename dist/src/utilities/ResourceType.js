"use strict";
/**
 * ResourceType
 * Defines the general data structure for a set of Resources.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ResourceType {
    constructor(props) {
        if (typeof props === 'string') {
            this.props = {
                name: props,
                keyProperty: 'id'
            };
        }
        else {
            const { store } = props;
            this.props = Object.assign({ keyProperty: 'id' }, props);
            if (store) {
                store.registerRecord(this);
            }
        }
    }
    getAllRecords(store, predicate) {
        const { getRecordTable } = store;
        const recordTable = getRecordTable(this);
        const result = predicate ? recordTable.records.filter(predicate) : recordTable.records;
        return result;
    }
    getRecordKey(record) {
        return record[this.props.keyProperty] || null;
    }
}
exports.ResourceType = ResourceType;
