import { FetcherProps, Fetcher } from './Fetcher';
import { Store } from './Store';
export declare let storeSymbol: symbol;
export declare let fetcherSymbol: symbol;
interface RestfulEnvironment {
    store: Store;
    request: Fetcher['fetchResource'];
    option: FetcherProps;
}
/**
 * Quick setup for react-restful
 * @param {FetcherProps} options
 */
export declare const setupEnvironment: (options: FetcherProps) => RestfulEnvironment;
export {};
