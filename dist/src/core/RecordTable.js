"use strict";
/**
 * @module RecordTable
 * The same structure of data will be stored in a RecordTable
 */
Object.defineProperty(exports, "__esModule", { value: true });
var RecordTable = /** @class */ (function () {
    function RecordTable(props) {
        this.props = props;
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
    RecordTable.prototype.findByKey = function (key) {
        var result = this.recordMap.get(key);
        return result || null;
    };
    RecordTable.prototype.upsert = function (record) {
        var resourceType = this.props.resourceType;
        var recordKey = resourceType.getRecordKey(record);
        if (!recordKey) {
            return "[" + resourceType.props.name + "] Upsert error: no key found!";
        }
        this.recordMap.set(recordKey, record);
        return true;
    };
    RecordTable.prototype.remove = function (record) {
        var resourceType = this.props.resourceType;
        var recordKey = resourceType.getRecordKey(record);
        this.recordMap.delete(recordKey);
    };
    return RecordTable;
}());
exports.RecordTable = RecordTable;
