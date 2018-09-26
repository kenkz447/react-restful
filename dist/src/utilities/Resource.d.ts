import { ResourceType } from './ResourceType';
import { Store } from './Store';
export interface ResourceProps<DataModel, Meta> {
    resourceType?: ResourceType;
    url: string;
    method?: string;
    mapDataToStore?: (data: DataModel, resourceType: ResourceType, store: Store) => void;
    afterFetch?: (params: ResourceParameter[] | undefined, fetchResult: DataModel, meta: Meta | undefined, resourceType: ResourceType | null, store: Store) => void;
}
export interface ResourceParameter {
    parameter?: string;
    value: Object | string | number;
    type: 'body' | 'path' | 'query';
    contentType?: string;
}
export declare class Resource<DataModel, Meta = {}> {
    recordType: ResourceType | null;
    url: string;
    method: string;
    mapDataToStore: ResourceProps<DataModel, Meta>['mapDataToStore'];
    afterFetch: ResourceProps<DataModel, Meta>['afterFetch'];
    constructor(props: ResourceProps<DataModel, Meta>);
    urlReslover(params?: Array<ResourceParameter>): string;
    requestInitReslover(params?: Array<ResourceParameter>): RequestInit | null;
}
