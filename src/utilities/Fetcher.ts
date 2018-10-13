// tslint:disable:no-any

import { Resource } from './Resource';
import { Store } from './Store';

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

export interface RequestInfo<Meta = {}> {
    /**
     * Meta from called request.
     */
    meta?: Meta;
    /**
     * Params from called request.
     */
    params?: RequestParameter[];
    /**
     * Origin Response instance after fetch.
     */
    response: Response;
}

export interface FetcherProps {
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
     */
    afterFetch?: (requestInfo: RequestInfo) => Promise<void>;
} 

export class Fetcher {
    props: FetcherProps;
    createDefaultRequestInit = () => ({ headers: new Headers() });

    constructor(props: FetcherProps) {
        this.props = {
            ...props
        };
    }
    /**
     * Function to make request by fetch method.
     * @param resource - Resource instance
     * @param {RequestParameter[] | RequestParameter} [params] - Array or a single RequestParameter object,
     * @param {Meta} [meta] - Anything, get it back in these hooks after fetch.
     */
    fetchResource = async <DataModel, Meta = {}>(
        resource: Resource<DataModel>,
        params?: RequestParameter[] | RequestParameter,
        meta?: Meta
    ) => {
        try {
            const {
                entry,
                store,
                beforeFetch,
                afterFetch,
                requestBodyParser,
                getResponseData
            } = this.props;

            const requestParams = Array.isArray(params) ?
                params :
                (params && [params]);

            let url = resource.urlReslover(requestParams);
            if (entry && url.startsWith('/')) {
                url = entry + url;
            }

            const usedRequestBodyParser = resource.requestBodyParser || requestBodyParser;

            const requestInit: RequestInit =
                resource.requestInitReslover(requestParams, usedRequestBodyParser) ||
                this.createDefaultRequestInit();

            requestInit.method = resource.method;

            const modifiedRequestInit = beforeFetch ? await beforeFetch(url, requestInit) : requestInit;
            const response = await fetch(url, modifiedRequestInit);

            const requestInfo: RequestInfo<Meta> = {
                meta,
                params: requestParams,
                response
            };

            if (afterFetch) {
                await afterFetch(requestInfo);
            }

            if (!response.ok) {
                if (resource.requestFailed) {
                    resource.requestFailed(requestInfo);
                }

                throw response;
            }

            const responseContentType = response.headers.get('content-type');
            if (responseContentType && responseContentType.startsWith('application/json')) {
                const usedGetResponseData = resource.getResponseData || getResponseData;

                const responseData = usedGetResponseData ?
                    await usedGetResponseData(requestInfo) :
                    await response.json();

                if (resource.requestSuccess) {
                    resource.requestSuccess(requestInfo);
                }
                
                if (resource.mapDataToStore && resource.recordType) {
                    const resourceTypeHasRegistered = store.resourceTypeHasRegistered(resource.recordType.name);
                    if (!resourceTypeHasRegistered) {
                        store.registerRecord(resource.recordType);
                    }

                    resource.mapDataToStore(responseData, resource.recordType, store);
                }
                return responseData;
            }
            const responseText = await response.text();
            return responseText;
        } catch (error) {
            throw error;
        }
    }
}