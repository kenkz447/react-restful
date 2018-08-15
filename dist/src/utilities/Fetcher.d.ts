import { Resource, ResourceParameter } from './Resource';
import { Store } from './Store';
interface FetcherProps {
    store: Store;
}
export declare class Fetcher {
    store: Store;
    createDefaultRequestInit: () => {
        headers: Headers;
    };
    constructor(props: FetcherProps);
    beforeFetch(url: string, requestInit: RequestInit): Promise<RequestInit>;
    fetch(url: string, requestInit: RequestInit): Promise<Response>;
    fetchResource<DataModel>(resource: Resource<DataModel>, params: ResourceParameter[]): Promise<any>;
}
export {};
