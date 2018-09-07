"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_base64_1 = require("js-base64");
class RecordTable {
    constructor(keyProperty) {
        this.keyProperty = keyProperty;
        this.recordMap = new Map();
    }
    get records() {
        const recordValue = this.recordMap.values();
        return Array.from(recordValue);
    }
    static encodeKey(keyPropertyValue) {
        const encoded = js_base64_1.Base64.encode(String(keyPropertyValue));
        return encoded;
    }
    findByKey(key) {
        const encoded = RecordTable.encodeKey(key);
        const result = this.recordMap.get(encoded);
        return result || null;
    }
    upsert(record) {
        const keyPropertyValue = record[this.keyProperty];
        const encoded = RecordTable.encodeKey(keyPropertyValue);
        this.recordMap.set(encoded, record);
        return true;
    }
    remove(record) {
        const keyPropertyValue = record[this.keyProperty];
        const encoded = RecordTable.encodeKey(keyPropertyValue);
        this.recordMap.delete(encoded);
    }
}
exports.RecordTable = RecordTable;
