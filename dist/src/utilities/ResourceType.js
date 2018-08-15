"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var ResourceType = /** @class */ (function () {
    function ResourceType(props) {
        this.name = props.name;
        this.schema = props.schema;
        var fKField = ResourceType.findPKField(props.schema);
        // TODO: Check NULL FK field, with an invariant message
        this.keyProperty = fKField.field;
        this.getChildTypeSchemafield = this.getChildTypeSchemafield.bind(this);
    }
    ResourceType.findPKField = function (schema) {
        return schema.find(function (o) { return o.type === 'PK'; });
    };
    ResourceType.prototype.getAllRecords = function (store, predicate) {
        var e_1, _a;
        var getRecordTable = store.getRecordTable;
        var recordTable = getRecordTable(this);
        var result = [];
        var existRecords = predicate ? recordTable.records.filter(predicate) : recordTable.records;
        try {
            for (var existRecords_1 = __values(existRecords), existRecords_1_1 = existRecords_1.next(); !existRecords_1_1.done; existRecords_1_1 = existRecords_1.next()) {
                var record = existRecords_1_1.value;
                var resultRecord = this.populate(store, record);
                result.push(resultRecord);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (existRecords_1_1 && !existRecords_1_1.done && (_a = existRecords_1.return)) _a.call(existRecords_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
    };
    ResourceType.prototype.populate = function (store, record) {
        var e_2, _a;
        var populateRecord = __assign({}, record);
        var _loop_1 = function (schemaField) {
            var relatedResourceType = schemaField.resourceType;
            switch (schemaField.type) {
                case 'FK':
                    var fkResourceType = store.getRegisteredResourceType(relatedResourceType);
                    var fkValue = record[schemaField.field];
                    var fkRecord = store.findOneRecord(fkResourceType, fkValue);
                    populateRecord[schemaField.field] = fkRecord;
                    break;
                case 'MANY':
                    if (!record[schemaField.field] ||
                        !record[schemaField.field].length) {
                        return "continue";
                    }
                    var childResourceType_1 = store.getRegisteredResourceType(relatedResourceType);
                    var children_1 = record[schemaField.field];
                    var isFlatIdMap_1 = (typeof children_1[0] === 'string');
                    var childRecords = childResourceType_1.getAllRecords(store, function (childRecordInstance) {
                        var childRecordInstanceKey = childResourceType_1.getRecordKey(childRecordInstance);
                        if (isFlatIdMap_1) {
                            return children_1.includes(childRecordInstanceKey);
                        }
                        var detectedChildInstance = children_1
                            .find(function (child) {
                            return childResourceType_1.getRecordKey(child) === childRecordInstanceKey;
                        });
                        return detectedChildInstance !== undefined;
                    });
                    populateRecord[schemaField.field] = childRecords;
                    break;
                default:
                    break;
            }
        };
        try {
            for (var _b = __values(this.schema), _c = _b.next(); !_c.done; _c = _b.next()) {
                var schemaField = _c.value;
                _loop_1(schemaField);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return populateRecord;
    };
    ResourceType.prototype.getAllChildType = function (store) {
        var childFields = this.schema.filter(function (o) { return o.type === 'MANY'; });
        return childFields.map(function (o) {
            return store.getRegisteredResourceType(o.resourceType);
        });
    };
    ResourceType.prototype.getChildTypeSchemafield = function (childType) {
        return this.schema.find(function (o) { return o.resourceType === childType.name; });
    };
    ResourceType.prototype.getRecordKey = function (record) {
        return record[this.keyProperty] || null;
    };
    return ResourceType;
}());
exports.ResourceType = ResourceType;
