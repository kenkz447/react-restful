"use strict";
/**
 * ResourceType
 * Defines the general data structure for a set of Resources.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var setupEnvironment_1 = require("./setupEnvironment");
var ResourceType = /** @class */ (function () {
    function ResourceType(props) {
        var _this = this;
        this.registerToStore = function (store) {
            if (store) {
                return void store.registerResourceType(_this);
            }
            if (!global[setupEnvironment_1.storeSymbol]) {
                return void ResourceType.unRegisterTypes.push(_this);
            }
            var globalStore = global[setupEnvironment_1.storeSymbol];
            return void globalStore.registerResourceType(_this);
        };
        if (typeof props === 'string') {
            this.props = {
                name: props,
                keyProperty: 'id'
            };
            this.registerToStore();
        }
        else {
            var store = props.store;
            this.props = __assign({ keyProperty: 'id' }, props);
            this.registerToStore(store);
        }
    }
    ResourceType.prototype.getAllRecords = function (store, predicate) {
        var getTable = store.getTable;
        var recordTable = getTable(this);
        var result = predicate ? recordTable.records.filter(predicate) : recordTable.records;
        return result;
    };
    ResourceType.prototype.getRecordKey = function (record) {
        var _a = this.props, getRecordKey = _a.getRecordKey, keyProperty = _a.keyProperty;
        if (getRecordKey) {
            return getRecordKey(record);
        }
        return record[keyProperty] || null;
    };
    // tslint:disable-next-line:no-any
    ResourceType.unRegisterTypes = [];
    return ResourceType;
}());
exports.ResourceType = ResourceType;
