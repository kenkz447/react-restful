// tslint:disable:no-any

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

export class Fetcher {
    props: FetcherProps;
    createDefaultRequestInit = () => ({ headers: new Headers() });

    constructor(props: FetcherProps) {
        this.props = {
            ...props
        };
    }

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
                await afterFetch(response);
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
                    await usedGetResponseData(response) :
                    await response.json();

                if (resource.mapDataToStore && resource.recordType) {
                    const resourceTypeHasRegistered = store.resourceTypeHasRegistered(resource.recordType.name);
                    if (!resourceTypeHasRegistered) {
                        store.registerRecord(resource.recordType);
                    }

                    resource.mapDataToStore(responseData, resource.recordType, store, requestInfo);
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