"use strict";
/**
 * @module RecordTable
 * The same structure of data will be stored in a RecordTable
 */
Object.defineProperty(exports, "__esModule", { value: true });
class RecordTable {
    constructor(props) {
        this.props = props;
        this.recordMap = new Map();
    }
    get records() {
        const recordValue = this.recordMap.values();
        return Array.from(recordValue);
    }
    findByKey(key) {
        const result = this.recordMap.get(key);
        return result || null;
    }
    upsert(record) {
        const { resourceType } = this.props;
        const recordKey = resourceType.getRecordKey(record);
        this.recordMap.set(recordKey, record);
        return true;
    }
    remove(record) {
        const { resourceType } = this.props;
        const recordKey = resourceType.getRecordKey(record);
        this.recordMap.delete(recordKey);
    }
}
exports.RecordTable = RecordTable;
