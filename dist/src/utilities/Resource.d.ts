import { ResourceType } from './ResourceType';
import { Store } from './Store';
import { RequestInfo, FetcherProps, RequestParameter, RequestParams } from './Fetcher';
export interface ResourceProps<DataModel, Meta> extends Pick<FetcherProps, 'requestBodyParser'>, Pick<FetcherProps, 'getResponseData'>, Pick<FetcherProps, 'onConfirm'> {
    resourceType?: ResourceType | null;
    url: string;
    method?: string;
    mapDataToStore?: (data: DataModel, resourceType: ResourceType, store: Store) => void;
    requestSuccess?: (requestInfo: RequestInfo<Meta>) => void;
    requestFailed?: (requestInfo: RequestInfo<Meta>) => void;
    getDefaultMeta?: () => {};
    getDefaultParams?: () => RequestParams;
}
export declare class Resource<DataModel, Meta = {}> {
    props: ResourceProps<DataModel, Meta>;
    static defaultMapDataToStore: (resource: Resource<any, any>) => (data: {} | {}[], resourceType: ResourceType<{}>, store: Store) => void;
    /**
     * Ensure url will start with '/'
     */
    static getUrl: (url: string) => string;
    constructor(props: ResourceProps<DataModel, Meta> | string);
    mixinWithDefaultParams: (requestParams: RequestParameter[]) => RequestParameter[];
    urlReslover(params?: Array<RequestParameter>): string;
    requestInitReslover(params?: Array<RequestParameter>, requestBodyParser?: FetcherProps['requestBodyParser']): RequestInit | null;
}
