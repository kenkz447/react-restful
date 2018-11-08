"use strict";
/**
 * ResourceType
 * Defines the general data structure for a set of Resources.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ResourceType {
    constructor(props) {
        if (typeof props === 'string') {
            this.name = props;
            this.schema = ResourceType.defaultProps.schema;
            const PKField = ResourceType.findPKField(this.schema);
            this.primaryKey = PKField.field;
        }
        else {
            const { name, schema, store } = props;
            this.name = name;
            this.schema = schema || ResourceType.defaultProps.schema;
            const PKField = ResourceType.findPKField(this.schema);
            this.primaryKey = PKField.field;
            if (store) {
                store.registerRecord(this);
            }
        }
    }
    static findPKField(schema) {
        return schema.find(o => o.type === 'PK');
    }
    getAllRecords(store, predicate) {
        const { getRecordTable } = store;
        const recordTable = getRecordTable(this);
        const result = predicate ? recordTable.records.filter(predicate) : recordTable.records;
        return result;
    }
    getAllChildType(store) {
        const childFields = this.schema.filter(o => o.type === 'MANY');
        return childFields.map(o => {
            return store.getRegisteredResourceType(o.resourceType);
        });
    }
    getChildTypeSchemafield(childType) {
        return this.schema.find(o => o.resourceType === childType.name);
    }
    getRecordKey(record) {
        return record[this.primaryKey] || null;
    }
}
ResourceType.defaultProps = {
    schema: [{
            field: 'id',
            type: 'PK'
        }]
};
exports.ResourceType = ResourceType;
