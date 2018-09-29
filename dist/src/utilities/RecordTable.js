"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RecordTable {
    constructor(keyProperty) {
        this.keyProperty = keyProperty;
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
        const recordKey = record[this.keyProperty];
        this.recordMap.set(recordKey, record);
        return true;
    }
    remove(record) {
        const recordKey = record[this.keyProperty];
        this.recordMap.delete(recordKey);
    }
}
exports.RecordTable = RecordTable;
