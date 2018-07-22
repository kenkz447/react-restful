import { Resource, ResourceParameter } from './Resource';
import { Store } from './Store';
interface FetcherProps {
    store: Store;
}
export declare class Fetcher {
    store: Store;
    constructor(props: FetcherProps);
    fetch(url: string, requestInit: RequestInit): Promise<Response>;
    fetchResource<DataModel>(resource: Resource<DataModel>, params: ResourceParameter[]): Promise<any>;
}
export {};
