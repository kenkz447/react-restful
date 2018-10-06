import { Record } from './RecordTable';
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
export declare class ResourceType<T extends Record = {}> {
    static defaultProps: Partial<ResourceTypeProps>;
    name: string;
    schema: ResourceTypeProps['schema'];
    primaryKey: string;
    static findPKField(schema: ResourceTypeProps['schema']): SchemaField;
    constructor(props: ResourceTypeProps | string);
    getAllRecords(store: Store, predicate?: (record: T) => boolean): T[];
    populate(store: Store, record: T): T;
    getAllChildType(store: Store): ResourceType<{}>[];
    getChildTypeSchemafield(childType: ResourceType): SchemaField;
    getRecordKey(record: T): any;
}
export {};
