import { FetcherProps, Fetcher } from './Fetcher';
export declare let storeSymbol: symbol;
export declare let fetcherSymbol: symbol;
export declare const getStore: () => any;
export declare let fetchResource: Fetcher['fetchResource'];
export declare const setupEnvironment: (fetcherProps: FetcherProps) => void;
