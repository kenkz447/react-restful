import { Resource } from './Resource';
import { Store } from './Store';
import { Record } from './RecordTable';
import { ResourceType } from './ResourceType';
export declare type RequestParams = RequestParameter[] | RequestParameter;
export interface RequestConfirmInfo<DataModel extends Record> {
    resource: Resource<DataModel>;
    message?: string;
    description?: string;
    params?: RequestParams;
    meta?: any;
}
export interface RequestInfo<Meta = {}> {
    meta?: Meta;
    params?: RequestParameter[];
    response: Response;
}
export interface RequestParameter {
    /**
     * Type of a parameter, operating under special mechanism.
     */
    type: 'body' | 'path' | 'query';
    /**
     * A key using for replace with Resource's URL in case 'type' is 'path'.
     * Example: with '/user/:id' (Resource's URL), parameter should be 'id'.
     * If type is 'query', it will used for key of query string.
     */
    parameter?: string;
    /**
     * Any thing your want send to server.
     * Depends on 'type':
     * - Case 'body': this is request body, object or FormBody.
     * - Case 'query': this is 'value' of query string (?key=value)
     * - Case 'path': this is replace with Resource' URL (replace with 'parameter' above)
     */
    value: Object | string | number;
    /**
     * A 'Content-Type' header, used for submit POST/PUT request.
     * Default: 'application/json'
     * Only used when your want submit a FormBody instance!
     */
    contentType?: string;
}
export interface FetcherProps {
    /**
     * Fetch method
     * Default: window.fetch
     */
    fetchMethod?: GlobalFetch['fetch'];
    /**
     * Store instance
     */
    store: Store;
    /**
     * Base endpoint URI. For example: 'https://api.domain.com/'.
     * It will be grafted to the beginning of Resource's URL before request.
     * Only used when Resource's URL start with '/'.
     */
    entry?: string;
    /**
     * Convert your request body before send
     * @param {string} bodyKey - body member key
     * @param {any} value - body member value, pair with key
     */
    requestBodyParser?: (bodyKey: string, value: any) => any;
    /**
     * Excute before making a request.
     * You can put your header e.g: 'Authorization - Bearer eyJhbGc...' into requestInit at this point.
     * @param {string} url - Request URL.
     * @param {RequestInit} requestInit - Origin RequestInit instance.
     * @returns {RequestInit} Modified RequestInit instance.
     */
    beforeFetch?: (url: string, requestInit: RequestInit) => RequestInit;
    /**
     * Get json data form Response instance after fetch.
     * Will not used if Resource has own getResponseData method.
     * If this props has not set and no Resource's getResponseData, `await response.json()` will be use.
     * @param {Response} response - fetch Response instance.
     * @param {RequestInfo} requestInfo - object contains helpful infomation
     */
    getResponseData?: (requestInfo: RequestInfo) => Promise<any>;
    /**
     * Excute after fetch process
     * It is suitable for side-effect processing when the request fails.
     * @param {RequestInfo} requestInfo
     */
    afterFetch?: (requestInfo: RequestInfo) => void;
    /**
     * If used RequestHelper, your have option to make a confirmation message before perform the request.
     * Using onConfirm to allow you setup a defaul confirm method for every request.
     * @param {RequestConfirmInfo} confirmInfo - object contains confirm message, description and request resource.
     * @returns {Promise<boolean>} Promise resolve with an boolean, true synonymous with 'yes'.
     */
    onConfirm?: (confirmInfo: RequestConfirmInfo<{}>) => Promise<boolean>;
    requestFailed?: (requestInfo: RequestInfo) => void;
    unexpectedErrorCatched?: (url: string, requestInit: RequestInit, error: Error) => any;
    defaultMapDataToProps?: (data: {} | Array<{}>, resource: Resource<any, {}>, resourceType: ResourceType<{}>, store: Store) => void;
}
export declare class Fetcher {
    props: FetcherProps;
    static defaultMapDataToStore: (data: {} | {}[], resource: Resource<{}, {}>, resourceType: ResourceType<{}>, store: Store) => void;
    createDefaultRequestInit: () => {
        headers: Headers;
    };
    constructor(props: FetcherProps);
    onRequestConfirm: (confirmInfo: RequestConfirmInfo<any>) => Promise<boolean>;
    /**
     * Function to make request by fetch method.
     * @param resource - Resource instance
     * @param {RequestParams} [params] - Array or a single RequestParameter object,
     * @param {Meta} [meta] - Anything, get it back in these hooks after fetch.
     */
    fetchResource: <DataModel, Meta = {}>(resource: Resource<DataModel, {}>, params?: RequestParameter | RequestParameter[] | undefined, meta?: Meta | undefined) => Promise<any>;
}
