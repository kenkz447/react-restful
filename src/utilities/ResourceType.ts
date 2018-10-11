/**
 * ResourceType
 * Defines the general data structure for a set of Resources.
 */

import { Record, RecordTable } from './RecordTable';
import { Store } from './Store';

export interface SchemaField {
    field: string;
    type: 'PK' | 'FK' | 'MANY';
    resourceType?: string;
}

interface ResourceTypeProps {
    name: string;
    schema?: SchemaField[];
    store?: Store;
}

export class ResourceType<T extends Record = {}> {
    static defaultProps: Partial<ResourceTypeProps> = {
        schema: [{
            field: 'id',
            type: 'PK'
        }]
    };

    name: string;
    schema: ResourceTypeProps['schema'];
    primaryKey!: string;

    static findPKField(schema: ResourceTypeProps['schema']) {
        return schema!.find(o => o.type === 'PK')!;
    }

    constructor(props: ResourceTypeProps | string) {
        if (typeof props === 'string') {
            this.name = props;
            this.schema = ResourceType.defaultProps.schema;
            const PKField = ResourceType.findPKField(this.schema);
            this.primaryKey = PKField.field;
        } else {
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

    getAllRecords(store: Store, predicate?: (record: T) => boolean) {
        const { getRecordTable } = store;
        const recordTable: RecordTable<T> = getRecordTable(this);
        const result: Array<T> = [];

        const existRecords = predicate ? recordTable.records.filter(predicate) : recordTable.records;
        for (const record of existRecords) {
            const resultRecord = this.populate(store, record);
            result.push(resultRecord);
        }

        return result;
    }

    populate(store: Store, record: T) {
        const populateRecord = Object.assign({}, record) as T;

        for (const schemaField of this.schema!) {
            const relatedResourceType = schemaField.resourceType as string;
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
                            .find((child: Record) => {
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

    getAllChildType(store: Store) {
        const childFields = this.schema!.filter(o => o.type === 'MANY');
        return childFields.map(o => {
            return store.getRegisteredResourceType(o.resourceType!);
        });
    }

    getChildTypeSchemafield(childType: ResourceType) {
        return this.schema!.find(o => o.resourceType === childType.name)!;
    }

    getRecordKey(record: T) {
        return record[this.primaryKey] || null;
    }
}