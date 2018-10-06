import { Resource } from './Resource';
import { Store } from './Store';
export interface RequestParameter {
    parameter?: string;
    value: Object | string | number;
    type: 'body' | 'path' | 'query';
    contentType?: string;
}
export interface RequestInfo<Meta> {
    meta?: Meta;
    params?: RequestParameter[];
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
    fetchResource: <DataModel, Meta = {}>(resource: Resource<DataModel, {}>, params?: RequestParameter | RequestParameter[] | undefined, meta?: Meta | undefined) => Promise<any>;
}
