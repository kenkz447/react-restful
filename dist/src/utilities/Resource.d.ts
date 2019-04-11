import { ResourceType } from './ResourceType';
import { Store } from './Store';
import { RequestInfo, FetcherProps, RequestParameter, RequestParams } from './Fetcher';
import { ObjectSchema } from 'yup';
export interface ResourceProps<T, R = T, M = {}> extends Pick<FetcherProps, 'requestBodyParser'>, Pick<FetcherProps, 'onConfirm'> {
    /**
     * Get json data form Response instance after fetch.
     * Will not used if Resource has own getResponseData method.
     * If this props has not set and no Resource's getResponseData, `await response.json()` will be use.
     * @param {Response} response - fetch Response instance.
     * @param {RequestInfo} requestInfo - object contains helpful infomation
     */
    getResponseData?: (requestInfo: RequestInfo) => Promise<any>;
    resourceType?: ResourceType<T>;
    url: string;
    method?: string;
    mapDataToStore?: (data: R, resourceType: ResourceType<T>, store: Store) => void;
    onRequestSuccess?: (requestInfo: RequestInfo<M>) => void;
    onRequestFailed?: (requestInfo: RequestInfo<M>) => void;
    getDefaultMeta?: (requestParams?: RequestParameter[]) => {};
    getDefaultParams?: (requestParams: RequestParameter[]) => RequestParams;
    bodySchema?: ObjectSchema<{}>;
    innerMapping?: {
        [K in keyof R]: (value: R[K], store: Store) => void;
    };
}
export declare class Resource<T, R = T, M = {}> {
    props: ResourceProps<T, R, M>;
    /**
     * Ensure url will start with '/'
     */
    static getUrl: (url: string) => string;
    constructor(props: ResourceProps<T, R, M> | string);
    mixinWithDefaultParams: (requestParams: RequestParameter[]) => RequestParameter[];
    urlReslover: (params?: RequestParameter[], parser?: ((value: any, params: RequestParameter) => any) | undefined) => string;
    requestInitReslover(params?: Array<RequestParameter>, requestBodyParser?: FetcherProps['requestBodyParser']): RequestInit | null;
}
