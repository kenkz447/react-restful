import { FetcherProps, Fetcher } from './Fetcher';
import { Store } from './Store';

export let storeSymbol = Symbol();
export let fetcherSymbol = Symbol();

export const getStore = () => global[storeSymbol];
export let request: Fetcher['fetchResource'] = () => new Promise(() => null);

export const setupEnvironment = (fetcherProps: FetcherProps) => {
    const store = new Store();
    const fetcher = new Fetcher({
        store: store,
        ...fetcherProps,
    });

    request = fetcher.fetchResource;

    if (global) {
        global[storeSymbol] = store;
        global[fetcherSymbol] = fetcher;
    }
};