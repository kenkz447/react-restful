"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResourceType {
    constructor(props) {
        this.name = props.name;
        this.schema = props.schema;
        const fKField = ResourceType.findPKField(props.schema);
        // TODO: Check NULL FK field, with an invariant message
        this.keyProperty = fKField.field;
        this.getChildTypeSchemafield = this.getChildTypeSchemafield.bind(this);
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
        return record[this.keyProperty] || null;
    }
}
exports.ResourceType = ResourceType;
