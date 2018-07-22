// tslint:disable:no-string-literal

import { Store } from './Store';
import { Fetcher } from './Fetcher';

export interface Environment {
    store: Store;
    fetcher: Fetcher;
}

export const setEnvironment = (environment: Environment) => {
    if (window['environment']) {
        return;
    }
    window['environment'] = environment;
};

export const getEnvironment = () => window['environment'];