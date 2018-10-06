import { FetcherProps } from './Fetcher';
import { Store } from './Store';
export declare let storeSymbol: symbol;
export declare let fetcherSymbol: symbol;
export declare const setupEnvironment: (fetcherProps: FetcherProps) => {
    store: Store;
    request: <DataModel, Meta = {}>(resource: import("./Resource").Resource<DataModel, {}>, params?: import("./Fetcher").RequestParameter | import("./Fetcher").RequestParameter[] | undefined, meta?: Meta | undefined) => Promise<any>;
};
