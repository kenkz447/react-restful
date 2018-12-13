import { ResourceType } from './ResourceType';
import { Store } from './Store';
import { RequestInfo, FetcherProps, RequestParameter, RequestParams } from './Fetcher';
import { ObjectSchema } from 'yup';

export interface ResourceProps<T, R = T, M = {}> extends
    Pick<FetcherProps, 'requestBodyParser'>,
    Pick<FetcherProps, 'onConfirm'> {
    /**
     * Get json data form Response instance after fetch.
     * Will not used if Resource has own getResponseData method.
     * If this props has not set and no Resource's getResponseData, `await response.json()` will be use.
     * @param {Response} response - fetch Response instance.
     * @param {RequestInfo} requestInfo - object contains helpful infomation
     */
    // tslint:disable-next-line:no-any
    getResponseData?: (requestInfo: RequestInfo) => Promise<any>;
    resourceType?: ResourceType<T>;
    url: string;
    method?: string;
    mapDataToStore?: (
        data: R,
        resourceType: ResourceType<T>,
        store: Store
    ) => void;
    requestSuccess?: (requestInfo: RequestInfo<M>) => void;
    requestFailed?: (requestInfo: RequestInfo<M>) => void;

    getDefaultMeta?: (requestParams?: RequestParameter[]) => {};
    getDefaultParams?: (requestParams: RequestParameter[]) => RequestParams;
    bodySchema?: ObjectSchema<R>;
}

const shouldParmeterIgnore = (param: RequestParameter) =>
    !param || param.type === 'body' || param.value === undefined || param.value === '';

export class Resource<T, R = T, M = {}> {
    props: ResourceProps<T, R, M>;

    /**
     * Ensure url will start with '/'
     */
    static getUrl = (url: string) => url.startsWith('http') ? url : (url.startsWith('/') ? url : `/${url}`);

    constructor(props: ResourceProps<T, R, M> | string) {
        if (typeof props === 'string') {
            this.props = {
                url: Resource.getUrl(props),
                method: 'GET'
            };
        } else {
            this.props = {
                ...props,
                resourceType: props.resourceType,
                url: Resource.getUrl(props.url),
                method: props.method || 'GET',
            };
        }
    }

    mixinWithDefaultParams = (requestParams: RequestParameter[]) => {
        let params = this.props.getDefaultParams!(requestParams);

        if (Array.isArray(params)) {
            return [...requestParams, ...params];
        }

        return [...requestParams, params];
    }

    urlReslover = (
        params: Array<RequestParameter> = [],
        parser?: FetcherProps['requestUrlParamParser']
    ): string => {
        const { getDefaultParams, url } = this.props;

        let uRL: string = url;
        const searchs: URLSearchParams = new URLSearchParams();

        const mixedRequestParams = getDefaultParams ? this.mixinWithDefaultParams(params) : params;

        for (const param of mixedRequestParams) {
            const ignore = shouldParmeterIgnore(param);
            if (ignore) {
                continue;
            }

            const paramValue = parser ? parser(param.value, param) : param.value;

            if (param.type === 'path') {
                uRL = uRL.replace(`/:${param.parameter}`, `/${paramValue}`);
            } else {
                searchs.append(param.parameter!, paramValue as string);
            }
        }

        const searchString = searchs.toString();
        return searchString ? `${uRL}?${searchString}` : uRL;
    }

    requestInitReslover(
        params: Array<RequestParameter> = [],
        requestBodyParser?: FetcherProps['requestBodyParser']
    ): RequestInit | null {
        const bodyParam = params.find(param => param.type === 'body');

        if (!bodyParam) {
            return null;
        }

        const body = bodyParam.value as object;

        let convertedBody = null;
        if (requestBodyParser) {
            convertedBody = {};
            for (const key in body) {
                if (body.hasOwnProperty(key)) {
                    const element = body[key];
                    convertedBody[key] = requestBodyParser(key, element);
                }
            }
        }

        const requestInit: RequestInit = {
            headers: new Headers({
                'Content-Type': bodyParam.contentType as string
            }),
            body: JSON.stringify(convertedBody || body),
            method: this.props.method
        };

        if (
            !bodyParam.contentType &&
            requestInit.headers instanceof Headers
        ) {
            requestInit.headers.set('Content-Type', 'application/json');
        }

        return requestInit;
    }
}