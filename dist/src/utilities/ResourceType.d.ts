import { RecordType } from './RecordTable';
export interface SchemaField {
    field: string;
    type: 'PK' | 'FK' | 'MANY';
    resourceType?: string;
}
interface RecordRelatedItem {
    type: 'FK' | 'MANY';
    value: any;
}
interface ResourceTypeProps {
    name: string;
    schema: SchemaField[];
}
export declare class ResourceType<T extends RecordType = {}> {
    name: string;
    schema: ResourceTypeProps['schema'];
    keyProperty: string;
    static findPKField(schema: ResourceTypeProps['schema']): SchemaField;
    constructor(props: ResourceTypeProps);
    getRecordRelated(resourceType: ResourceType, record: T): {
        [key: string]: RecordRelatedItem;
    };
    getRecordKey(record: T): {} | null;
}
export {};
