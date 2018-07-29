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
var ResourceType = /** @class */ (function () {
    function ResourceType(props) {
        this.name = props.name;
        this.schema = props.schema;
        var fKField = ResourceType.findPKField(props.schema);
        // TODO: Check NULL FK field, with an invariant message
        this.keyProperty = fKField.field;
    }
    ResourceType.findPKField = function (schema) {
        return schema.find(function (o) { return o.type === 'PK'; });
    };
    ResourceType.prototype.getAllRecords = function (store) {
        var getRecordTable = store.getRecordTable;
        var recordTable = getRecordTable(this);
        return recordTable.records;
    };
    ResourceType.prototype.getRecordRelated = function (resourceType, record) {
        var e_1, _a;
        var recordToMapping = Object.assign({}, record);
        var recordToMappingMeta = {};
        var _loop_1 = function (schemaField) {
            var relatedField = recordToMapping[schemaField.field];
            if (!relatedField) {
                return "continue";
            }
            switch (schemaField.type) {
                case 'FK':
                    var fkKey = relatedField[this_1.keyProperty];
                    recordToMappingMeta[schemaField.field] = {
                        type: 'FK',
                        value: fkKey
                    };
                    break;
                case 'MANY':
                    if (!Array.isArray(relatedField)) {
                        throw new Error('MANY related but received something is not an array!');
                    }
                    var manyKeys = relatedField.map(function (o) { return o[schemaField.field]; });
                    recordToMappingMeta[schemaField.field] = {
                        type: 'FK',
                        value: manyKeys
                    };
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
        return recordToMappingMeta;
    };
    ResourceType.prototype.getRecordKey = function (record) {
        return record[this.keyProperty] || null;
    };
    return ResourceType;
}());
exports.ResourceType = ResourceType;
