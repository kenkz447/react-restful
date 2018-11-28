"use strict";
/**
 * ResourceType
 * Defines the general data structure for a set of Resources.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const setupEnvironment_1 = require("./setupEnvironment");
class ResourceType {
    constructor(props) {
        this.registerToStore = (store) => {
            if (store) {
                return void store.registerResourceType(this);
            }
            if (!global[setupEnvironment_1.storeSymbol]) {
                return void ResourceType.unRegisterTypes.push(this);
            }
            const globalStore = global[setupEnvironment_1.storeSymbol];
            return void globalStore.registerResourceType(this);
        };
        if (typeof props === 'string') {
            this.props = {
                name: props,
                keyProperty: 'id'
            };
        }
        else {
            const { store } = props;
            this.props = Object.assign({ keyProperty: 'id' }, props);
            this.registerToStore(store);
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
ResourceType.unRegisterTypes = [];
exports.ResourceType = ResourceType;
