import { ResourceType } from './ResourceType';
import { Store } from './Store';
import { RequestInfo, FetcherProps, RequestParameter, RequestParams } from './Fetcher';
import { ObjectSchema } from 'yup';
export interface ResourceProps<DataModel, Meta> extends Pick<FetcherProps, 'requestBodyParser'>, Pick<FetcherProps, 'getResponseData'>, Pick<FetcherProps, 'onConfirm'> {
    resourceType?: ResourceType<{}>;
    url: string;
    method?: string;
    mapDataToStore?: (data: DataModel, resourceType: ResourceType<{}>, store: Store) => void;
    requestSuccess?: (requestInfo: RequestInfo<Meta>) => void;
    requestFailed?: (requestInfo: RequestInfo<Meta>) => void;
    getDefaultMeta?: (requestParams?: RequestParameter[]) => {};
    getDefaultParams?: (requestParams: RequestParameter[]) => RequestParams;
    bodySchema?: ObjectSchema<any>;
}
export declare class Resource<DataModel, Meta = {}> {
    props: ResourceProps<DataModel, Meta>;
    /**
     * Ensure url will start with '/'
     */
    static getUrl: (url: string) => string;
    constructor(props: ResourceProps<DataModel, Meta> | string);
    mixinWithDefaultParams: (requestParams: RequestParameter[]) => RequestParameter[];
    urlReslover(params?: Array<RequestParameter>): string;
    requestInitReslover(params?: Array<RequestParameter>, requestBodyParser?: FetcherProps['requestBodyParser']): RequestInit | null;
}
