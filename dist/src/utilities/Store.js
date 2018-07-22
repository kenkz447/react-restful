"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RecordTable_1 = require("./RecordTable");
var Store = /** @class */ (function () {
    function Store() {
        this.recordTypes = [];
        this.recordTables = {};
        this.subscribeStacks = [];
    }
    Store.prototype.subscribe = function (resourceTypes, callback) {
        this.subscribeStacks.push({
            resourceTypes: resourceTypes,
            callback: callback
        });
    };
    Store.prototype.getRegisteredResourceType = function (resourceTypeName) {
        var resourceType = this.recordTypes.find(function (o) { return o.name === resourceTypeName; });
        if (!resourceType) {
            throw new Error("Not found any resource type with name " + resourceTypeName + "!");
        }
        return resourceType;
    };
    Store.prototype.getRecordTable = function (resourceType) {
        return this.recordTables[resourceType.name];
    };
    Store.prototype.registerRecordType = function (resourceType) {
        if (this.recordTables[resourceType.name]) {
            return;
        }
        var recordKeyProperty = resourceType.schema.find(function (o) { return o.type === 'PK'; });
        if (recordKeyProperty === undefined) {
            throw new Error(resourceType.name + " has no PK field!");
        }
        var newRecordTable = new RecordTable_1.RecordTable(recordKeyProperty.field);
        this.recordTables[resourceType.name] = newRecordTable;
        this.recordTypes.push(resourceType);
    };
    Store.prototype.mapRecord = function (resourceType, record) {
        var table = this.recordTables[resourceType.name];
        var upsertResult = table.upsert(record);
        if (!upsertResult) {
            throw new Error('upsert not working!');
        }
        this.doSubcribleCallbacks({
            type: 'mapping',
            resourceType: resourceType,
            record: record
        });
        return true;
    };
    Store.prototype.removeRecord = function (resourceType, record) {
        var table = this.recordTables[resourceType.name];
        table.remove(record);
        this.doSubcribleCallbacks({
            type: 'remove',
            resourceType: resourceType,
            record: record
        });
        return true;
    };
    Store.prototype.findRecordByKey = function (resourceType, key) {
        var table = this.getRecordTable(resourceType);
        var resultByKey = table.findByKey(key);
        return resultByKey;
    };
    Store.prototype.findOneRecord = function (resourceType, specs) {
        var table = this.getRecordTable(resourceType);
        return table.records.find(specs) || null;
    };
    /**
     * Map a fetched data of type to store
     * * For FK, we only update primitive fields of FK record
     */
    Store.prototype.dataMapping = function (resourceType, record) {
        var e_1, _a, e_2, _b;
        var recordToMapping = Object.assign({}, record);
        try {
            for (var _c = __values(resourceType.schema), _d = _c.next(); !_d.done; _d = _c.next()) {
                var schemaField = _d.value;
                var resourceTypeName = schemaField.resourceType;
                var relatedField = recordToMapping[schemaField.field];
                if (!relatedField) {
                    continue;
                }
                switch (schemaField.type) {
                    case 'FK':
                        var fkResourceType = this.getRegisteredResourceType(resourceTypeName);
                        this.dataMapping(fkResourceType, relatedField);
                        // delete recordToMapping[schemaField.field];
                        break;
                    case 'MANY':
                        if (!Array.isArray(relatedField)) {
                            throw new Error('MANY related but received something is not an array!');
                        }
                        var manyResourceType = this.getRegisteredResourceType(resourceTypeName);
                        try {
                            for (var relatedField_1 = __values(relatedField), relatedField_1_1 = relatedField_1.next(); !relatedField_1_1.done; relatedField_1_1 = relatedField_1.next()) {
                                var relatedRecord = relatedField_1_1.value;
                                this.dataMapping(manyResourceType, relatedRecord);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (relatedField_1_1 && !relatedField_1_1.done && (_b = relatedField_1.return)) _b.call(relatedField_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        // delete recordToMapping[schemaField.field];
                        break;
                    default:
                        break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.mapRecord(resourceType, recordToMapping);
    };
    Store.prototype.doSubcribleCallbacks = function (event) {
        var e_3, _a;
        try {
            for (var _b = __values(this.subscribeStacks), _c = _b.next(); !_c.done; _c = _b.next()) {
                var subscribeStack = _c.value;
                if (subscribeStack.resourceTypes.includes(event.resourceType)) {
                    subscribeStack.callback(event);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    return Store;
}());
exports.Store = Store;
