import { ResourceType } from './ResourceType';
import { Store } from './Store';
import { RequestInfo, FetcherProps, RequestParameter } from './Fetcher';

export interface ResourceProps<DataModel, Meta> {
    resourceType?: ResourceType;
    url: string;
    method?: string;
    /**
     * Get json data form response after fetch.
     */
    getResponseData?: (response: Response) => Promise<DataModel>;
    mapDataToStore?: (
        data: DataModel,
        resourceType: ResourceType,
        store: Store,
        requestInfo?: RequestInfo<Meta>
    ) => void;
    requestFailed?: (requestInfo: RequestInfo<Meta>) => void;
}

const shouldParmeterIgnore = (param: RequestParameter) =>
    !param || param.type === 'body' || param.value === undefined || param.value === '';

export class Resource<DataModel, Meta = {}> {
    recordType: ResourceType | null;
    url: string;
    method: string;
    mapDataToStore: ResourceProps<DataModel, Meta>['mapDataToStore'];
    requestFailed: ResourceProps<DataModel, Meta>['requestFailed'];
    getResponseData: ResourceProps<DataModel, Meta>['getResponseData'];

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

            if (resource.method === 'DELETE') {
                store.removeRecord(resourceType, data);
            } else {
                store.mapRecord(resourceType, data);
            }
        }
    }

    constructor(props: ResourceProps<DataModel, Meta> | string) {
        if (typeof props === 'string') {
            this.recordType = null;
            this.url = props;
            this.method = 'GET';
        } else {
            this.recordType = props.resourceType || null;
            this.url = props.url;
            this.method = props.method || 'GET';

            this.mapDataToStore = props.mapDataToStore;
            if (!this.mapDataToStore && props.resourceType) {
                this.mapDataToStore = Resource.defaultMapDataToStore(this);
            }
            this.requestFailed = props.requestFailed;
        }
    }

    urlReslover(params: Array<RequestParameter> = []): string {
        let uRL: string = this.url;
        const searchs: URLSearchParams = new URLSearchParams();
        for (const param of params) {
            const ignore = shouldParmeterIgnore(param);
            if (ignore) {
                continue;
            }

            if (param.type === 'path') {
                uRL = uRL.replace(`/:${param.parameter}`, `/${param.value}`);
            } else {
                searchs.append(param.parameter as string, param.value as string);
            }
        }

        const searchString = searchs.toString();
        return searchString ? `${uRL}?${searchString}` : uRL;
    }

    requestInitReslover(
        params: Array<RequestParameter> = [],
        bodyStringify?: FetcherProps['bodyStringify']
    ): RequestInit | null {
        const bodyParam = params.find(param => param.type === 'body');

        if (!bodyParam) {
            return null;
        }

        const body = bodyParam.value as object;

        let convertedBody = null;
        if (bodyStringify) {
            convertedBody = {};
            for (const key in body) {
                if (body.hasOwnProperty(key)) {
                    const element = body[key];
                    convertedBody[key] = bodyStringify(element);
                }
            }
        }

        const requestInit: RequestInit = {
            headers: new Headers({
                'Content-Type': bodyParam.contentType as string
            }),
            body: JSON.stringify(convertedBody || body),
            method: this.method
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