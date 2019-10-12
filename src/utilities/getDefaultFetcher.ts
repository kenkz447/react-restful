import { fetcherSymbol } from '../core';

export const getDefaultFetcher = () => {
    if (!global) {
        return null;
    }

    return global[fetcherSymbol];
};