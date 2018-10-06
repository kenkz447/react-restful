import { FetcherProps, Fetcher } from './Fetcher';
import { Store } from './Store';

export let storeSymbol = Symbol();
export let fetcherSymbol = Symbol();

export const setupEnvironment = (fetcherProps: FetcherProps) => {
    const store = new Store();
    const fetcher = new Fetcher({
        store: store,
        ...fetcherProps,
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