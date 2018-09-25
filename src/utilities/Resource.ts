import { RecordType } from './RecordTable';
import { ResourceType } from './ResourceType';
import { Store } from './Store';

export interface ResourceProps<DataModel, Meta> {
    resourceType?: ResourceType;
    url: string;
    method: string;
    mapDataToStore?: (data: DataModel, resourceType: ResourceType, store: Store) => void;
    afterFetch?: (
        params: ResourceParameter[] | undefined,
        fetchResult: DataModel,
        meta: Meta | undefined,
        resourceType: ResourceType | null,
        store: Store
    ) => void;
}

export interface ResourceParameter {
    parameter?: string;
    value: Object | string | number;
    type: 'body' | 'path' | 'query';
    contentType?: string;
}

export class Resource<DataModel, Meta = {}> {
    recordType: ResourceType | null;
    url: string;
    method: string;
    mapDataToStore: ResourceProps<DataModel, Meta>['mapDataToStore'];
    afterFetch: ResourceProps<DataModel, Meta>['afterFetch'];

    constructor(props: ResourceProps<DataModel, Meta>) {
        this.recordType = props.resourceType || null;
        this.url = props.url;
        this.method = props.method;
        this.mapDataToStore = props.mapDataToStore;
        this.afterFetch = props.afterFetch;
    }

    urlReslover(params: Array<ResourceParameter> = []): string {
        let uRL: string = this.url;
        const searchs: URLSearchParams = new URLSearchParams();
        for (const param of params) {
            if (!param || param.type === 'body' || param.value === undefined) {
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

    requestInitReslover(params: Array<ResourceParameter> = []): RequestInit | null {
        const body: ResourceParameter = params.find(param => param.type === 'body') as ResourceParameter;

        if (!body) {
            return null;
        }

        const requestInit: RequestInit = {
            headers: new Headers({
                'Content-Type': body.contentType as string
            }),
            body: JSON.stringify(body.value),
            method: this.method
        };

        if (!body.contentType) {
            (requestInit.headers as Headers).set('Content-Type', 'application/json');
        }

        return requestInit;
    }
}