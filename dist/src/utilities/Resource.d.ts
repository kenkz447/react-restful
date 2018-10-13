import { ResourceType } from './ResourceType';
import { Store } from './Store';
import { RequestInfo, FetcherProps, RequestParameter } from './Fetcher';
export interface ResourceProps<DataModel, Meta> extends Pick<FetcherProps, 'requestBodyParser'>, Pick<FetcherProps, 'getResponseData'>, Pick<FetcherProps, 'onConfirm'> {
    resourceType?: ResourceType;
    url: string;
    method?: string;
    mapDataToStore?: (data: DataModel, resourceType: ResourceType, store: Store) => void;
    requestSuccess?: (requestInfo: RequestInfo<Meta>) => void;
    requestFailed?: (requestInfo: RequestInfo<Meta>) => void;
}
export declare class Resource<DataModel, Meta = {}> {
    recordType: ResourceType | null;
    url: string;
    method: string;
    mapDataToStore: ResourceProps<DataModel, Meta>['mapDataToStore'];
    requestFailed: ResourceProps<DataModel, Meta>['requestFailed'];
    getResponseData: ResourceProps<DataModel, Meta>['getResponseData'];
    requestBodyParser: ResourceProps<DataModel, Meta>['requestBodyParser'];
    requestSuccess: ResourceProps<DataModel, Meta>['requestSuccess'];
    onConfirm: ResourceProps<DataModel, Meta>['onConfirm'];
    static defaultMapDataToStore: (resource: Resource<any, any>) => (data: {} | {}[], resourceType: ResourceType<{}>, store: Store) => void;
    /**
     * Ensure url will start with '/'
     */
    static getUrl: (url: string) => string;
    constructor(props: ResourceProps<DataModel, Meta> | string);
    urlReslover(params?: Array<RequestParameter>): string;
    requestInitReslover(params?: Array<RequestParameter>, requestBodyParser?: FetcherProps['requestBodyParser']): RequestInit | null;
}
