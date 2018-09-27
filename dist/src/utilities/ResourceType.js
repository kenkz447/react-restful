"use strict";
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
                store.registerRecordType(this);
            }
        }
    }
    static findPKField(schema) {
        return schema.find(o => o.type === 'PK');
    }
    getAllRecords(store, predicate) {
        const { getRecordTable } = store;
        const recordTable = getRecordTable(this);
        const result = [];
        const existRecords = predicate ? recordTable.records.filter(predicate) : recordTable.records;
        for (const record of existRecords) {
            const resultRecord = this.populate(store, record);
            result.push(resultRecord);
        }
        return result;
    }
    populate(store, record) {
        const populateRecord = Object.assign({}, record);
        for (const schemaField of this.schema) {
            const relatedResourceType = schemaField.resourceType;
            switch (schemaField.type) {
                case 'FK':
                    const fkResourceType = store.getRegisteredResourceType(relatedResourceType);
                    const fkValue = record[schemaField.field];
                    const fkRecord = store.findOneRecord(fkResourceType, fkValue);
                    populateRecord[schemaField.field] = fkRecord;
                    break;
                case 'MANY':
                    if (!record[schemaField.field] ||
                        !record[schemaField.field].length) {
                        continue;
                    }
                    const childResourceType = store.getRegisteredResourceType(relatedResourceType);
                    const children = record[schemaField.field];
                    const isFlatIdMap = (typeof children[0] === 'string');
                    const childRecords = childResourceType.getAllRecords(store, (childRecordInstance) => {
                        const childRecordInstanceKey = childResourceType.getRecordKey(childRecordInstance);
                        if (isFlatIdMap) {
                            return children.includes(childRecordInstanceKey);
                        }
                        const detectedChildInstance = children
                            .find((child) => {
                            return childResourceType.getRecordKey(child) === childRecordInstanceKey;
                        });
                        return detectedChildInstance !== undefined;
                    });
                    populateRecord[schemaField.field] = childRecords;
                    break;
                default:
                    break;
            }
        }
        return populateRecord;
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
