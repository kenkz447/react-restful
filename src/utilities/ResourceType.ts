import { Store } from './Store';

export interface SchemaField {
    property: string;
    type: 'PK' | 'FK' | 'MANY';
    resourceType?: string;
}

interface ResourceTypeProps {
    name: string;
    schema: SchemaField[];
}

export class ResourceType<T = {}> {
    name: string;
    schema: ResourceTypeProps['schema'];
    keyProperty?: string;

    static findPKField(schema: ResourceTypeProps['schema']) {
        return schema.find(o => o.type === 'PK') as SchemaField;
    }

    constructor(props: ResourceTypeProps) {
        this.name = props.name;
        this.schema = props.schema;

        const fKField = ResourceType.findPKField(props.schema);
        // TODO: Check NULL FK field, with an invariant message
        this.keyProperty = fKField.property;
    }

    /**
     * Map a fetched data of type to store
     * * For FK, we only update primitive fields of FK record
     */
    dataMapping(record: T, store: Store) {
        const nonePKSchema = this.schema.filter(o => o.type !== 'PK');
        for (const schemaField of nonePKSchema) {
            if (record[schemaField.property]) {
                switch (schemaField.type) {
                    case 'FK':

                        break;
                    default:
                        break;
                }
            }
        }
    }
}