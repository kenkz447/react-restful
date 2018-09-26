import { FetcherProps, Fetcher } from './Fetcher';
import { Store } from './Store';

export let storeSymbol = Symbol();
export let fetcherSymbol = Symbol();

export const getStore = () => window[storeSymbol];
export let fetchResource: Fetcher['fetchResource'];

export const setupEnvironment = (fetcherProps: FetcherProps) => {
    const store = new Store();
    const fetcher = new Fetcher({
        store: store,
        ...fetcherProps,
    });

    fetchResource = fetcher.fetchResource;

    window[storeSymbol] = store;
    window[fetcherSymbol] = fetcher;
};