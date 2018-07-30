import { RecordType, RecordTable } from './RecordTable';
import { Store } from './Store';

export interface SchemaField {
    field: string;
    type: 'PK' | 'FK' | 'MANY';
    resourceType?: string;
}

interface RecordRelatedItem {
    type: 'FK' | 'MANY';
    // tslint:disable-next-line:no-any
    value: any;
}

interface ResourceTypeProps {
    name: string;
    schema: SchemaField[];
}

export class ResourceType<T extends RecordType = {}> {
    name: string;
    schema: ResourceTypeProps['schema'];
    keyProperty: string;

    static findPKField(schema: ResourceTypeProps['schema']) {
        return schema.find(o => o.type === 'PK') as SchemaField;
    }

    constructor(props: ResourceTypeProps) {
        this.name = props.name;
        this.schema = props.schema;

        const fKField = ResourceType.findPKField(props.schema);
        // TODO: Check NULL FK field, with an invariant message
        this.keyProperty = fKField.field;

        this.getChildTypeSchemafield = this.getChildTypeSchemafield.bind(this);
    }

    getAllRecords(store: Store, predicate?: (record: T) => boolean) {
        const { getRecordTable } = store;
        const recordTable: RecordTable<T> = getRecordTable(this);
        const result = [];

        const existRecords = predicate ? recordTable.records.filter(predicate) : recordTable.records;
        for (const record of existRecords) {
            const resultRecord = this.populate(store, record);
            result.push(resultRecord);
        }

        return result;
    }

    populate(store: Store, record: T) {
        const populateRecord = { ...record as object };
        for (const schemaField of this.schema) {
            switch (schemaField.type) {
                case 'FK':
                    const fkResourceType = store.getRegisteredResourceType(schemaField.resourceType as string);
                    const fkValue = record[schemaField.field];
                    const fkRecord = store.findRecordByKey(fkResourceType, fkValue);
                    populateRecord[schemaField.field] = fkRecord;
                    break;
                case 'MANY':
                    if (!record[schemaField.field]) {
                        continue;
                    }

                    const childResourceType = store.getRegisteredResourceType(schemaField.resourceType as string);
                    const childrenKeys: Array<string> = record[schemaField.field];
                    const childRecords = childResourceType.getAllRecords(store, (childRecord) => {
                        return childrenKeys.includes(childResourceType.getRecordKey(childRecord));
                    });
                    populateRecord[schemaField.field] = childRecords;
                    break;
                default:
                    break;
            }
        }
        return populateRecord;
    }

    getAllChildType(store: Store) {
        const childFields = this.schema.filter(o => o.type === 'MANY');
        return childFields.map(o => {
            return store.getRegisteredResourceType(o.resourceType as string);
        });
    }

    getChildTypeSchemafield(childType: ResourceType) {
        return this.schema.find(o => o.resourceType === childType.name) as SchemaField;
    }

    getRecordKey(record: T) {
        return record[this.keyProperty] || null;
    }
}