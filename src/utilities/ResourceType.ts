import { RecordType } from './RecordTable';
import { Store } from './Store';

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
}