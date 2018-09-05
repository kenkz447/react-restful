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
export declare class Resource<DataModel> {
    recordType: ResourceType;
    url: string;
    method: string;
    mapDataToStore: ResourceProps<DataModel>['mapDataToStore'];
    afterFetch: ResourceProps<DataModel>['afterFetch'];
    constructor(props: ResourceProps<DataModel>);
    urlReslover(params: Array<ResourceParameter>): string;
    requestInitReslover(params: Array<ResourceParameter>): RequestInit | null;
}
