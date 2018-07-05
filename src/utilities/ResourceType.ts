import { RecordType } from './RecordTable';
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
    }

    getRecordRelated(resourceType: ResourceType, record: T) {
        const recordToMapping = Object.assign({}, record) as T;
        const recordToMappingMeta: { [key: string]: RecordRelatedItem } = {};

        for (const schemaField of resourceType.schema) {
            const relatedField = recordToMapping[schemaField.field] as {};

            if (!relatedField) {
                continue;
            }

            switch (schemaField.type) {
                case 'FK':
                    const fkKey = relatedField[this.keyProperty];
                    recordToMappingMeta[schemaField.field] = {
                        type: 'FK',
                        value: fkKey
                    };
                    break;
                case 'MANY':
                    if (!Array.isArray(relatedField)) {
                        throw new Error('MANY related but received something is not an array!');
                    }
                    const manyKeys = relatedField.map(o => o[schemaField.field]);
                    recordToMappingMeta[schemaField.field] = {
                        type: 'FK',
                        value: manyKeys
                    };
                    break;
                default:
                    break;
            }
        }
        return recordToMappingMeta;
    }

    getRecordKey(record: T) {
        return record[this.keyProperty] || null;
    }
}