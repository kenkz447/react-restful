import { Resource, ResourceParameter } from './Resource';
import { Store } from './Store';
interface FetcherProps {
    store: Store;
    beforeFetch?: (url: string, requestInit: RequestInit) => RequestInit;
    afterFetch?: (response: Response) => void;
}
export declare class Fetcher {
    props: FetcherProps;
    createDefaultRequestInit: () => {
        headers: Headers;
    };
    constructor(props: FetcherProps);
    fetch(url: string, requestInit: RequestInit): Promise<Response>;
    fetchResource<DataModel>(resource: Resource<DataModel>, params: ResourceParameter[]): Promise<any>;
}
export {};
