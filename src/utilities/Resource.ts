import { RecordType } from './RecordTable';
import { ResourceType } from './ResourceType';
import { Store } from './Store';

export interface ResourceProps<DataModel> {
    resourceType: ResourceType;
    url: string;
    method: string;
    mapDataToStore?: (data: DataModel, resourceType: ResourceType, store: Store) => void;
    afterFetch?: <TMeta>(params: ResourceParameter[], fetchResult: DataModel, meta?: TMeta) => void;
}

export interface ResourceParameter {
    parameter?: string;
    value: Object | string | number;
    type: 'body' | 'path' | 'query';
    contentType?: string;
}

export class Resource<DataModel> {
    recordType: ResourceType;
    url: string;
    method: string;
    mapDataToStore: ResourceProps<DataModel>['mapDataToStore'];
    afterFetch: ResourceProps<DataModel>['afterFetch'];

    constructor(props: ResourceProps<DataModel>) {
        this.recordType = props.resourceType;
        this.url = props.url;
        this.method = props.method;
        this.mapDataToStore = props.mapDataToStore;
        this.afterFetch = props.afterFetch;
    }

    urlReslover(params: Array<ResourceParameter>): string {
        let uRL: string = this.url;
        const searchs: URLSearchParams = new URLSearchParams();
        for (const param of params) {
            if (param.type === 'body') {
                continue;
            }

            if (param.type === 'path') {
                uRL = uRL.replace(`/:${param.parameter}`, `/${param.value}`);
            } else {
                searchs.append(param.parameter as string, param.value as string);
            }
        }

        return `${uRL}?${searchs.toString()}`;
    }

    requestInitReslover(params: Array<ResourceParameter>): RequestInit | null {
        if (!params) {
            return null;
        }

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