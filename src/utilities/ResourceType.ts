import { Store } from './Store';
import { RecordType } from './RecordTable';

export interface SchemaField {
    field: string;
    type: 'PK' | 'FK' | 'MANY';
    resourceType?: string;
}

interface ResourceTypeProps {
    name: string;
    schema: SchemaField[];
}

export class ResourceType<T extends RecordType = {}> {
    name: string;
    schema: ResourceTypeProps['schema'];
    keyProperty: string;

    // * store will inject when this register with store
    store!: Store;

    static findPKField(schema: ResourceTypeProps['schema']) {
        return schema.find(o => o.type === 'PK') as SchemaField;
    }

    constructor(props: ResourceTypeProps) {
        this.name = props.name;
        this.schema = props.schema;

        const fKField = ResourceType.findPKField(props.schema);
        // TODO: Check NULL FK field, with an invariant message
        this.keyProperty = fKField.field;
    }

    /**
     * Map a fetched data of type to store
     * * For FK, we only update primitive fields of FK record
     */
    dataMapping(record: T) {
        const recordToMapping = Object.assign({}, record) as T;

        for (const schemaField of this.schema) {
            const resourceTypeName = schemaField.resourceType as string;
            const relatedField = recordToMapping[schemaField.field];

            if (!relatedField) {
                continue;
            }

            switch (schemaField.type) {
                case 'FK':
                    const fkResourceType = this.store.getRegisteredResourceType(resourceTypeName);
                    fkResourceType.dataMapping(relatedField);
                    delete recordToMapping[schemaField.field];
                    break;
                case 'MANY':
                    if (!Array.isArray(relatedField)) {
                        throw new Error('MANY related but received something is not an array!');
                    }
                    const manyResourceType = this.store.getRegisteredResourceType(resourceTypeName);
                    for (const relatedRecord of relatedField) {
                        manyResourceType.dataMapping(relatedRecord);
                    }
                    delete recordToMapping[schemaField.field];
                    break;
                default:
                    break;
            }
        }

        this.store.mapRecord(this, recordToMapping);
    }

    getRecordKey(record: T) {
        return record[this.keyProperty] || null;
    }
}