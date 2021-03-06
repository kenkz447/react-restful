import { FetcherProps, Fetcher } from './Fetcher';
import { Store } from './Store';

export let storeSymbol = Symbol();
export let fetcherSymbol = Symbol();

interface RestfulEnvironment {
    store: Store;
    request: Fetcher['fetchResource'];
}

export const setupEnvironment = (options: FetcherProps): RestfulEnvironment => {
    const { store } = options;
    
    const fetcher = new Fetcher({
        store: store,
        ...options,
    });

    if (global) {
        global[storeSymbol] = store;
        global[fetcherSymbol] = fetcher;
    }

    return {
        store: store,
        request: fetcher.fetchResource
    };
};