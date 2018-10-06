import { ResourceType } from './ResourceType';
import { Store } from './Store';
import { RequestInfo, FetcherProps, RequestParameter } from './Fetcher';
export interface ResourceProps<DataModel, Meta> {
    resourceType?: ResourceType;
    url: string;
    method?: string;
    mapDataToStore?: (data: DataModel, resourceType: ResourceType, store: Store, requestInfo?: RequestInfo<Meta>) => void;
    requestFailed?: (requestInfo: RequestInfo<Meta>) => void;
}
export declare class Resource<DataModel, Meta = {}> {
    recordType: ResourceType | null;
    url: string;
    method: string;
    mapDataToStore: ResourceProps<DataModel, Meta>['mapDataToStore'];
    requestFailed: ResourceProps<DataModel, Meta>['requestFailed'];
    static defaultMapDataToStore: (resource: Resource<any, any>) => (data: {} | {}[], resourceType: ResourceType<{}>, store: Store) => void;
    constructor(props: ResourceProps<DataModel, Meta> | string);
    urlReslover(params?: Array<RequestParameter>): string;
    requestInitReslover(params?: Array<RequestParameter>, bodyStringify?: FetcherProps['bodyStringify']): RequestInit | null;
}
