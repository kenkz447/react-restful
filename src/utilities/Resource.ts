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
    onRequestSuccess?: (requestInfo: RequestInfo<M>) => void;
    onRequestFailed?: (requestInfo: RequestInfo<M>) => void;

    getDefaultMeta?: (requestParams?: RequestParameter[]) => {};
    getDefaultParams?: (requestParams: RequestParameter[]) => RequestParams;
    bodySchema?: ObjectSchema<{}>;
    innerMapping?: Partial<{ [K in keyof R]: (value: R[K], store: Store) => void }>;
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
                if (Array.isArray(paramValue)) {
                    for (const paramValueItem of paramValue) {
                        searchs.append(param.parameter!, paramValueItem);
                    }
                } else {
                    searchs.append(param.parameter!, paramValue as string);
                }
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

        let requestBody = { ...body };

        if (requestBodyParser) {
            const bodyKeys = Object.keys(body);
            bodyKeys.forEach(bodyKey => {
                const element = body[bodyKey];
                requestBody[bodyKey] = requestBodyParser(bodyKey, element);
            });
        }

        const requestInit: RequestInit = {
            headers: new Headers({
                'Content-Type': bodyParam.contentType || 'application/json'
            }),
            body: JSON.stringify(requestBody),
            method: this.props.method
        };

        return requestInit;
    }
}