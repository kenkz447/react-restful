// tslint:disable:no-any

import { Resource } from './Resource';
import { Store } from './Store';
import { Record } from './RecordTable';

export type RequestParams = RequestParameter[] | RequestParameter;

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
}

export class Fetcher {
    props: FetcherProps;
    createDefaultRequestInit = () => ({ headers: new Headers() });

    constructor(props: FetcherProps) {
        this.props = {
            ...props
        };
    }

    onRequestConfirm = async (confirmInfo: RequestConfirmInfo<any>) => {
        const { onConfirm } = this.props;
        if (!onConfirm) {
            return true;
        }

        const confirmer = confirmInfo.resource.props.onConfirm || onConfirm;

        return await confirmer(confirmInfo);
    }

    /**
     * Function to make request by fetch method.
     * @param resource - Resource instance
     * @param {RequestParams} [params] - Array or a single RequestParameter object,
     * @param {Meta} [meta] - Anything, get it back in these hooks after fetch.
     */
    fetchResource = async <DataModel, Meta = {}>(
        resource: Resource<DataModel>,
        params?: RequestParams,
        meta?: Meta
    ) => {
        const {
            entry,
            store,
            beforeFetch,
            afterFetch,
            requestBodyParser,
            getResponseData,
            requestFailed,
            unexpectedErrorCatched
        } = this.props;

        const resourceProps = resource.props;

        const requestParams = Array.isArray(params) ?
            params :
            (params && [params]);

        let url = resource.urlReslover(requestParams);
        if (entry && url.startsWith('/')) {
            url = entry + url;
        }

        const usedRequestBodyParser = resourceProps.requestBodyParser || requestBodyParser;

        const requestInit: RequestInit =
            resource.requestInitReslover(requestParams, usedRequestBodyParser) ||
            this.createDefaultRequestInit();

        requestInit.method = resourceProps.method;

        const modifiedRequestInit = beforeFetch ? await beforeFetch(url, requestInit) : requestInit;

        let response!: Response;

        try {
            response = await fetch(url, modifiedRequestInit);
        } catch (error) {
            if (unexpectedErrorCatched) {
                throw unexpectedErrorCatched(url, modifiedRequestInit, error);
            }

            if (error instanceof Error) {
                throw error;
            }

            throw new Error(error);
        }
        
        const requestMeta = resourceProps.getDefaultMeta ?
            resourceProps.getDefaultMeta() as Meta :
            meta;

        const requestInfo: RequestInfo<Meta> = {
            meta: requestMeta,
            params: requestParams,
            response
        };

        if (!response.ok) {
            if (resourceProps.requestFailed) {
                resourceProps.requestFailed(requestInfo);
            }

            if (requestFailed) {
                requestFailed(requestInfo);
            }

            throw response;
        }

        if (afterFetch) {
            afterFetch(requestInfo);
        }

        const responseContentType = response.headers.get('content-type');
        if (responseContentType && responseContentType.startsWith('application/json')) {
            const usedGetResponseData = resourceProps.getResponseData || getResponseData;

            const responseData = usedGetResponseData ?
                await usedGetResponseData(requestInfo) :
                await response.json();

            if (resourceProps.requestSuccess) {
                resourceProps.requestSuccess(requestInfo);
            }

            if (resourceProps.mapDataToStore && resourceProps.resourceType) {
                const resourceTypeHasRegistered = store.resourceTypeHasRegistered(resourceProps.resourceType.name);
                if (!resourceTypeHasRegistered) {
                    store.registerRecord(resourceProps.resourceType);
                }

                resourceProps.mapDataToStore(responseData, resourceProps.resourceType, store);
            }

            return responseData;
        }

        return await response.text();
    }
}