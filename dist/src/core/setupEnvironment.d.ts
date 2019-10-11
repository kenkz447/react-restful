import { FetcherProps, Fetcher } from './Fetcher';
import { Store } from './Store';
export declare let storeSymbol: string | symbol;
export declare let fetcherSymbol: string | symbol;
interface RestfulEnvironment {
    store: Store;
    request: Fetcher['fetchResource'];
}
export declare const setupEnvironment: (options: FetcherProps) => RestfulEnvironment;
export {};
