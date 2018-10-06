import { Resource, ResourceParameter } from './Resource';
import { Store } from './Store';
export interface RequestInfo<Meta> {
    meta?: Meta;
    params?: ResourceParameter[];
    response: Response;
}
export interface FetcherProps {
    store: Store;
    entry?: string;
    bodyStringify?: (value: any) => any;
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
    fetchResource<DataModel, Meta = {}>(resource: Resource<DataModel>, params?: ResourceParameter[] | ResourceParameter, meta?: Meta): Promise<any>;
}
