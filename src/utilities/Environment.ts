import { Resource, ResourceParameters } from './Resource';
import { Store } from './Store';

export interface Environment {
    store: Store;
    fetch(url: string, requestInit: RequestInit | null): Promise<Response>;
}

export class EnvironmentX {
    store = new Store();

    fetch (url: string, requestInit: RequestInit | null) {
        return fetch(url, requestInit as RequestInit);
    }

    async fetcher(resource: Resource, params: ResourceParameters[]) {
        try {
            const url = resource.urlReslover(params);
            const fetchInit = resource.requestInitReslover(params);

            const response = await this.fetch(url, fetchInit);

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(responseText);
            }

            const json = await response.json();
            await resource.mapRecordToStore(json);
            return json;
        } catch (error) {
            throw new Error(error);
        }
    }

    onDataChange() {
        //
    }
}

export function createEnvironment(params: Environment) {
    return params;
}