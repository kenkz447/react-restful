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
    store?: Store;
}
export declare class ResourceType<T extends RecordType = {}> {
    name: string;
    schema: ResourceTypeProps['schema'];
    keyProperty: string;
    static findPKField(schema: ResourceTypeProps['schema']): SchemaField;
    constructor(props: ResourceTypeProps);
    getAllRecords(store: Store, predicate?: (record: T) => boolean): {}[];
    populate(store: Store, record: T): {};
    getAllChildType(store: Store): ResourceType<{}>[];
    getChildTypeSchemafield(childType: ResourceType): SchemaField;
    getRecordKey(record: T): any;
}
export {};
