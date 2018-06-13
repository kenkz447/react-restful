import { Store } from './Store';

export interface Environment {
    store: Store;
    fetch(url: string, requestInit: RequestInit | null): Promise<Response>;
}

export function createEnvironment(params: Environment) {
    return params;
}