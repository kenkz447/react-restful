import { Store } from './Store';
import { Fetcher } from './Fetcher';
export interface Environment {
    store: Store;
    fetcher: Fetcher;
}
export declare const setEnvironment: (environment: Environment) => void;
export declare const getEnvironment: () => any;
