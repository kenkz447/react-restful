import { ResourceType } from './ResourceType';
import { Store } from './Store';
import { RequestInfo } from './Fetcher';
export interface ResourceProps<DataModel, Meta> {
    resourceType?: ResourceType;
    url: string;
    method?: string;
    mapDataToStore?: (data: DataModel, resourceType: ResourceType, store: Store, requestInfo?: RequestInfo<Meta>) => void;
    requestFailed?: (requestInfo: RequestInfo<Meta>) => void;
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
    requestFailed: ResourceProps<DataModel, Meta>['requestFailed'];
    static defaultMapDataToStore: (resource: Resource<any, any>) => (data: {} | {}[], resourceType: ResourceType<{}>, store: Store) => void;
    constructor(props: ResourceProps<DataModel, Meta> | string);
    urlReslover(params?: Array<ResourceParameter>): string;
    requestInitReslover(params?: Array<ResourceParameter>): RequestInit | null;
}
