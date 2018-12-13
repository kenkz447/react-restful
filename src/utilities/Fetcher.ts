// tslint:disable:no-any

import { Resource } from './Resource';
import { Store } from './Store';
import { Record } from './RecordTable';
import { ResourceType } from './ResourceType';
import { SchemaError } from './SchemaError';

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
     * Convert your request param value before send
     * @param {any} value - body member value, pair with key
     */
    requestUrlParamParser?: (value: any, params: RequestParameter) => any;

    /**
     * Excute before making a request. 
     * You can put your header e.g: 'Authorization - Bearer eyJhbGc...' into requestInit at this point.
     * @param {string} url - Request URL.
     * @param {RequestInit} requestInit - Origin RequestInit instance.
     * @returns {RequestInit} Modified RequestInit instance.
     */
    beforeFetch?: (url: string, requestInit: RequestInit) => RequestInit;

    /**
     * Excute after fetch process
     * @param {RequestInfo} requestInfo
     */
    onRequestSuccess?: (requestInfo: RequestInfo) => Promise<void>;

    /**
     * Excute after fetch failed
     * @param {RequestInfo} requestInfo
     */
    onRequestFailed?: (requestInfo: RequestInfo) => Promise<any>;

    /**
     * Excute after unexpected error
     * @param {string} url
     * @param {RequestInit} requestInit
     * @param {Error} error
     */
    onRequestError?: (url: string, requestInit: RequestInit, error: Error) => Promise<any>;

    /**
     * If used RequestHelper, your have option to make a confirmation message before perform the request.
     * Using onConfirm to allow you setup a defaul confirm method for every request.
     * @param {RequestConfirmInfo} confirmInfo - object contains confirm message, description and request resource.
     * @returns {Promise<boolean>} Promise resolve with an boolean, true synonymous with 'yes'.
     */
    onConfirm?: (confirmInfo: RequestConfirmInfo<{}>) => Promise<boolean>;

    defaultMapDataToStore?: <T, R = T, M = {}>(
        data: R,
        resource: Resource<T, R, M>,
        resourceType: ResourceType<T>,
        store: Store
    ) => void;

    onSchemaError?: <T, R, M>(error: SchemaError, resource: Resource<T, R, M>) => void;
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
    fetchResource = async <T, R = T, M = {}>(
        resource: Resource<T, R, M>,
        params?: RequestParams,
        meta?: M
    ): Promise<R> => {
        try {
            await SchemaError.requestValidate(resource, params);
        } catch (error) {
            const { onSchemaError } = this.props;
            if (onSchemaError) {
                onSchemaError(error, resource);
            }

            throw error;
        }

        const {
            entry,
            store,
            beforeFetch,
            onRequestSuccess,
            requestBodyParser,
            onRequestFailed,
            onRequestError,
            fetchMethod,
            defaultMapDataToStore,
            requestUrlParamParser
        } = this.props;

        const resourceProps = resource.props;

        const requestParams = Array.isArray(params) ?
            params :
            (params && [params]);

        let requestUrl = resource.urlReslover(requestParams, requestUrlParamParser);

        if (entry && requestUrl.startsWith('/')) {
            requestUrl = entry + requestUrl;
        }

        const usedRequestBodyParser = resourceProps.requestBodyParser || requestBodyParser;

        const requestInit: RequestInit =
            resource.requestInitReslover(requestParams, usedRequestBodyParser) ||
            this.createDefaultRequestInit();

        requestInit.method = resourceProps.method;

        const modifiedRequestInit = beforeFetch ? await beforeFetch(requestUrl, requestInit) : requestInit;

        let response!: Response;

        const useFetchMethod = fetchMethod || fetch;

        try {
            response = await useFetchMethod(requestUrl, modifiedRequestInit);
        } catch (error) {
            if (onRequestError) {
                throw onRequestError(requestUrl, modifiedRequestInit, error);
            }

            throw error;
        }

        const requestMeta = resourceProps.getDefaultMeta ?
            resourceProps.getDefaultMeta(requestParams) as M :
            meta;

        const requestInfo: RequestInfo<M> = {
            meta: requestMeta,
            params: requestParams,
            response
        };

        if (!response.ok) {
            if (resourceProps.onRequestFailed) {
                throw await resourceProps.onRequestFailed(requestInfo);
            }

            if (onRequestFailed) {
                throw await onRequestFailed(requestInfo);
            }

            throw response;
        }

        if (onRequestSuccess) {
            onRequestSuccess(requestInfo);
        }

        const responseContentType = response.headers.get('content-type');

        if (!responseContentType || !responseContentType.startsWith('application/json')) {
            const text = await response.text();
            return { text } as any;
        }

        const usedGetResponseData = resourceProps.getResponseData;

        const responseData = usedGetResponseData ?
            await usedGetResponseData(requestInfo) :
            await response.json();

        if (resourceProps.onRequestSuccess) {
            resourceProps.onRequestSuccess(requestInfo);
        }

        if (resourceProps.resourceType) {
            if (resourceProps.mapDataToStore) {
                resourceProps.mapDataToStore(responseData, resourceProps.resourceType, store);
            } else if (defaultMapDataToStore) {
                defaultMapDataToStore(responseData, resource, resourceProps.resourceType, store);
            }
        }

        return responseData;
    }
}