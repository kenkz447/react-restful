import { storeSymbol } from '../core';

export const getDefaultStore = () => {
    if (!global) {
        return null;
    }

    return global[storeSymbol];
};