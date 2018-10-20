import { ResourceType } from './ResourceType';
import { Store } from './Store';
import { RequestInfo, FetcherProps, RequestParameter } from './Fetcher';

export interface ResourceProps<DataModel, Meta> extends
    Pick<FetcherProps, 'requestBodyParser'>,
    Pick<FetcherProps, 'getResponseData'>,
    Pick<FetcherProps, 'onConfirm'> {
    resourceType?: ResourceType | null;
    url: string;
    method?: string;
    mapDataToStore?: (
        data: DataModel,
        resourceType: ResourceType,
        store: Store
    ) => void;
    requestSuccess?: (requestInfo: RequestInfo<Meta>) => void;
    requestFailed?: (requestInfo: RequestInfo<Meta>) => void;

    getDefaultMeta?: () => {};
    getDefaulParams?: () => RequestParameter;
}

const shouldParmeterIgnore = (param: RequestParameter) =>
    !param || param.type === 'body' || param.value === undefined || param.value === '';

export class Resource<DataModel, Meta = {}> {
    props: ResourceProps<DataModel, Meta>;

    // tslint:disable-next-line:no-any
    static defaultMapDataToStore = (resource: Resource<any, any>) => (
        data: {} | Array<{}>,
        resourceType: ResourceType,
        store: Store
    ) => {
        if (Array.isArray(data)) {
            for (const record of data) {
                store.mapRecord(resourceType, record);
            }
        } else {
            const hasKey = resourceType.getRecordKey(data);

            if (!hasKey) {
                return;
            }

            if (resource.props.method === 'DELETE') {
                store.removeRecord(resourceType, data);
            } else {
                store.mapRecord(resourceType, data);
            }
        }
    }

    /**
     * Ensure url will start with '/'
     */
    static getUrl = (url: string) => url.startsWith('http') ? url : (url.startsWith('/') ? url : `/${url}`);

    constructor(props: ResourceProps<DataModel, Meta> | string) {
        if (typeof props === 'string') {
            this.props = {
                resourceType: null,
                url: Resource.getUrl(props),
                method: 'GET'
            };
        } else {
            this.props = {
                ...props,
                resourceType: props.resourceType || null,
                url: Resource.getUrl(props.url),
                method: props.method || 'GET',
            };

            if (!props.mapDataToStore && props.resourceType) {
                this.props.mapDataToStore = Resource.defaultMapDataToStore(this);
            }
        }
    }

    mixinWithDefaultParams = (requestParams: RequestParameter[]) => {
        let params = this.props.getDefaulParams!();

        if (Array.isArray(params)) {
            return [...requestParams, ...params];
        }

        return [...requestParams, params];
    }

    urlReslover(params: Array<RequestParameter> = []): string {
        const { getDefaulParams, url } = this.props;

        let uRL: string = url;
        const searchs: URLSearchParams = new URLSearchParams();

        const mixedRequestParams = getDefaulParams ? this.mixinWithDefaultParams(params) : params;

        for (const param of mixedRequestParams) {
            const ignore = shouldParmeterIgnore(param);
            if (ignore) {
                continue;
            }

            if (param.type === 'path') {
                uRL = uRL.replace(`/:${param.parameter}`, `/${param.value}`);
            } else {
                searchs.append(param.parameter!, param.value as string);
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