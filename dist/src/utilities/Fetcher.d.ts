import { Resource } from './Resource';
import { Store } from './Store';
export interface RequestParameter {
    parameter?: string;
    value: Object | string | number;
    type: 'body' | 'path' | 'query';
    contentType?: string;
}
export interface RequestInfo<Meta> {
    meta?: Meta;
    params?: RequestParameter[];
    response: Response;
}
export interface FetcherProps {
    store: Store;
    entry?: string;
    /**
     * Convert your request body before send
     * @param {string} bodyKey - body member key
     * @param {any} value - body member value, pair with key
     */
    requestBodyParser?: (bodyKey: string, value: any) => any;
    beforeFetch?: (url: string, requestInit: RequestInit) => RequestInit;
    /**
     * Get json data form response after fetch.
     * Will not used if Resource has own getResponseData method.
     * @param {Response} response - fetch Response instance
     */
    getResponseData?: (response: Response) => Promise<any>;
    afterFetch?: (response: Response) => void;
}
export declare class Fetcher {
    props: FetcherProps;
    createDefaultRequestInit: () => {
        headers: Headers;
    };
    constructor(props: FetcherProps);
    fetchResource: <DataModel, Meta = {}>(resource: Resource<DataModel, {}>, params?: RequestParameter | RequestParameter[] | undefined, meta?: Meta | undefined) => Promise<any>;
}
