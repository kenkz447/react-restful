"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var js_base64_1 = require("js-base64");
var RecordTable = /** @class */ (function () {
    function RecordTable(keyProperty) {
        this.keyProperty = keyProperty;
        this.recordMap = new Map();
    }
    Object.defineProperty(RecordTable.prototype, "records", {
        get: function () {
            var recordValue = this.recordMap.values();
            return Array.from(recordValue);
        },
        enumerable: true,
        configurable: true
    });
    RecordTable.encodeKey = function (keyPropertyValue) {
        var encoded = js_base64_1.Base64.encode(String(keyPropertyValue));
        return encoded;
    };
    RecordTable.prototype.findByKey = function (key) {
        var encoded = RecordTable.encodeKey(key);
        var result = this.recordMap.get(encoded);
        return result || null;
    };
    RecordTable.prototype.upsert = function (record) {
        var keyPropertyValue = record[this.keyProperty];
        var encoded = RecordTable.encodeKey(keyPropertyValue);
        this.recordMap.set(encoded, record);
        return true;
    };
    RecordTable.prototype.remove = function (record) {
        var keyPropertyValue = record[this.keyProperty];
        var encoded = RecordTable.encodeKey(keyPropertyValue);
        this.recordMap.delete(encoded);
    };
    return RecordTable;
}());
exports.RecordTable = RecordTable;
