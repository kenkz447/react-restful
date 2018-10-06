import { FetcherProps } from './Fetcher';
import { Store } from './Store';
export declare let storeSymbol: symbol;
export declare let fetcherSymbol: symbol;
export declare const setupEnvironment: (fetcherProps: FetcherProps) => {
    store: Store;
    request: <DataModel, Meta = {}>(resource: import("./Resource").Resource<DataModel, {}>, params?: import("./Resource").ResourceParameter | import("./Resource").ResourceParameter[] | undefined, meta?: Meta | undefined) => Promise<any>;
};
