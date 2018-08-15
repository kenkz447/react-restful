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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RecordTable_1 = require("./RecordTable");
var v1_1 = __importDefault(require("uuid/v1"));
var Store = /** @class */ (function () {
    function Store() {
        this.resourceTypes = [];
        this.recordTables = {};
        this.subscribeStacks = [];
        this.subscribe = this.subscribe.bind(this);
        this.getRecordTable = this.getRecordTable.bind(this);
    }
    Store.prototype.subscribe = function (resourceTypes, callback) {
        var subscribeId = v1_1.default();
        this.subscribeStacks.push({
            resourceTypes: resourceTypes,
            callback: callback,
            subscribeId: subscribeId
        });
        return subscribeId;
    };
    Store.prototype.unSubscribe = function (subscribeId) {
        return this.subscribeStacks.filter(function (o) { return o.subscribeId !== subscribeId; });
    };
    Store.prototype.getRegisteredResourceType = function (resourceTypeName) {
        var resourceType = this.resourceTypes.find(function (o) { return o.name === resourceTypeName; });
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
        this.resourceTypes.push(resourceType);
    };
    Store.prototype.mapRecord = function (resourceType, record) {
        var table = this.recordTables[resourceType.name];
        var upsertResult = table.upsert(record);
        // TODO: map orther related records
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
        if (!specs) {
            return null;
        }
        var specsType = typeof specs;
        switch (specsType) {
            case 'string':
            case 'number':
                return this.findRecordByKey(resourceType, specs);
            case 'object':
                var recordKey = resourceType.getRecordKey(specs);
                return this.findRecordByKey(resourceType, recordKey);
            default:
                var table = this.getRecordTable(resourceType);
                return table.records.find(specs) || null;
        }
    };
    /**
     * Map a fetched data of type to store
     * * For FK, we only update primitive fields of FK record
     */
    Store.prototype.dataMapping = function (resourceType, record) {
        var e_1, _a;
        var recordToMapping = Object.assign({}, record);
        var recordKey = resourceType.getRecordKey(record);
        var _loop_1 = function (schemaField) {
            var e_2, _a;
            var resourceTypeName = schemaField.resourceType;
            switch (schemaField.type) {
                case 'FK':
                    var fkValue = recordToMapping[schemaField.field];
                    var fkIsObject = (typeof fkValue === 'object');
                    if (!fkIsObject) {
                        return "continue";
                    }
                    var fkResourceType = this_1.getRegisteredResourceType(resourceTypeName);
                    // We need update MANY field FKResource
                    var fkValueKey = fkResourceType.getRecordKey(fkValue);
                    var tryGetFKObjectFormStore = this_1.findRecordByKey(fkResourceType, fkValueKey);
                    if (tryGetFKObjectFormStore) {
                        fkValue = tryGetFKObjectFormStore;
                    }
                    var fkChildSchemaField = fkResourceType.getChildTypeSchemafield(resourceType);
                    if (fkValue[fkChildSchemaField.field]) {
                        if (!fkValue[fkChildSchemaField.field].includes(recordKey)) {
                            fkValue[fkChildSchemaField.field].push(recordKey);
                        }
                    }
                    else {
                        fkValue[fkChildSchemaField.field] = [recordKey];
                    }
                    this_1.dataMapping(fkResourceType, fkValue);
                    // Replace the original object with their id
                    recordToMapping[schemaField.field] = fkResourceType.getRecordKey(fkValue);
                    break;
                case 'MANY':
                    var childValue = recordToMapping[schemaField.field];
                    if (!childValue) {
                        return "continue";
                    }
                    if (!Array.isArray(childValue)) {
                        throw new Error('MANY related but received something is not an array!');
                    }
                    var childValueIsArrayObject = (typeof childValue[0] === 'object');
                    if (!childValueIsArrayObject) {
                        return "continue";
                    }
                    // TODO: We need update FK field of childResource to map with parent record
                    var childResourceType_1 = this_1.getRegisteredResourceType(resourceTypeName);
                    try {
                        for (var childValue_1 = __values(childValue), childValue_1_1 = childValue_1.next(); !childValue_1_1.done; childValue_1_1 = childValue_1.next()) {
                            var relatedRecord = childValue_1_1.value;
                            this_1.dataMapping(childResourceType_1, relatedRecord);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (childValue_1_1 && !childValue_1_1.done && (_a = childValue_1.return)) _a.call(childValue_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    // Replace the original object array with their ID array
                    recordToMapping[schemaField.field] = childValue.map(function (o) { return childResourceType_1.getRecordKey(o); });
                    break;
                default:
                    break;
            }
        };
        var this_1 = this;
        try {
            for (var _b = __values(resourceType.schema), _c = _b.next(); !_c.done; _c = _b.next()) {
                var schemaField = _c.value;
                _loop_1(schemaField);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
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
