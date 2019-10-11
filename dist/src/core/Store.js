"use strict";
/**
 * Store is where data is stored from the API.
 */
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var RecordTable_1 = require("./RecordTable");
var Store = /** @class */ (function () {
    function Store() {
        var _this = this;
        // tslint:disable-next-line:no-any
        this.subscribe = function (resourceTypes, callback) {
            var subscribeId = Symbol();
            _this.subscribeStacks.push({
                resourceTypes: resourceTypes,
                callback: callback,
                subscribeId: subscribeId
            });
            return function () {
                _this.unSubscribe(subscribeId);
            };
        };
        this.unSubscribe = function (subscribeId) {
            _this.subscribeStacks = _this.subscribeStacks.filter(function (o) { return o.subscribeId !== subscribeId; });
        };
        this.resourceTypeHasRegistered = function (resourceTypeName) {
            var found = _this.resourceTypes.find(function (o) { return o.props.name === resourceTypeName; });
            return found !== undefined;
        };
        this.getRegisteredResourceType = function (resourceTypeName) {
            var resourceType = _this.resourceTypes.find(function (o) { return o.props.name === resourceTypeName; });
            if (!resourceType) {
                throw new Error("Not found any resource type with name " + resourceTypeName + "!");
            }
            return resourceType;
        };
        this.getTable = function (resourceType) {
            return _this.recordTables[resourceType.props.name];
        };
        this.registerResourceType = function (resourceType) {
            if (_this.recordTables[resourceType.props.name]) {
                return;
            }
            var newRecordTable = new RecordTable_1.RecordTable({
                resourceType: resourceType
            });
            _this.recordTables[resourceType.props.name] = newRecordTable;
            _this.resourceTypes.push(resourceType);
        };
        this.removeOne = function (resourceType, record) {
            var table = _this.recordTables[resourceType.props.name];
            table.remove(record);
            _this.doSubcribleCallbacks({
                type: 'remove',
                resourceType: resourceType,
                value: record
            });
            return true;
        };
        this.findOne = function (resourceType, specs) {
            if (!specs) {
                return null;
            }
            var specsType = typeof specs;
            switch (specsType) {
                case 'string':
                case 'number':
                    return _this.findRecordByKey(resourceType, specs);
                case 'object':
                    var recordKey = resourceType.getRecordKey(specs);
                    return _this.findRecordByKey(resourceType, recordKey);
                default:
                    var table = _this.getTable(resourceType);
                    return table.records.find(specs) || null;
            }
        };
        this.findMany = function (resourceType, predicate) {
            var table = _this.getTable(resourceType);
            if (!table) {
                return [];
            }
            return table.records.filter(predicate);
        };
        this.dataMapping = function (resourceType, data) {
            if (Array.isArray(data)) {
                return void _this.mapRecords(resourceType, data);
            }
            _this.mapRecord(resourceType, data);
        };
        this.findRecordByKey = function (resourceType, key) {
            var table = _this.getTable(resourceType);
            var resultByKey = table.findByKey(key);
            return resultByKey;
        };
        this.resourceTypes = [];
        this.recordTables = {};
        this.subscribeStacks = [];
    }
    Store.prototype.mapRecords = function (resourceType, records) {
        var e_1, _a;
        var table = this.recordTables[resourceType.props.name];
        try {
            for (var records_1 = __values(records), records_1_1 = records_1.next(); !records_1_1.done; records_1_1 = records_1.next()) {
                var record = records_1_1.value;
                var upsertResult = table.upsert(record);
                if (upsertResult !== true) {
                    throw new Error(upsertResult);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (records_1_1 && !records_1_1.done && (_a = records_1.return)) _a.call(records_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.doSubcribleCallbacks({
            type: 'mapping',
            resourceType: resourceType,
            value: records
        });
    };
    Store.prototype.mapRecord = function (resourceType, record) {
        var table = this.recordTables[resourceType.props.name];
        var upsertResult = table.upsert(record);
        if (upsertResult !== true) {
            throw new Error(upsertResult);
        }
        this.doSubcribleCallbacks({
            type: 'mapping',
            resourceType: resourceType,
            value: record
        });
        return true;
    };
    Store.prototype.doSubcribleCallbacks = function (event) {
        var e_2, _a;
        try {
            for (var _b = __values(this.subscribeStacks), _c = _b.next(); !_c.done; _c = _b.next()) {
                var subscribeStack = _c.value;
                if (subscribeStack.resourceTypes.includes(event.resourceType)) {
                    subscribeStack.callback(event);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    return Store;
}());
exports.Store = Store;
