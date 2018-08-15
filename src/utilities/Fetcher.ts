import { Resource, ResourceParameter } from './Resource';
import { Store } from './Store';

interface FetcherProps {
    store: Store;
}
export class Fetcher {
    store: Store;
    createDefaultRequestInit = () => ({ headers: new Headers() });

    constructor(props: FetcherProps) {
        this.store = props.store;
    }

    async beforeFetch(url: string, requestInit: RequestInit) {
        return requestInit;
    }

    fetch(url: string, requestInit: RequestInit) {
        return fetch(url, requestInit);
    }

    async fetchResource<DataModel>(resource: Resource<DataModel>, params: ResourceParameter[]) {
        try {
            const url = resource.urlReslover(params);

            const requestInit =
                resource.requestInitReslover(params) ||
                this.createDefaultRequestInit();

            const modifiedRequestInit = await this.beforeFetch(url, requestInit);
            const response = await this.fetch(url, modifiedRequestInit);

            if (!response.ok) {
                throw response;
            }

            const responseContentType = response.headers.get('content-type');
            if (responseContentType && responseContentType.startsWith('application/json')) {
                const json = await response.json();
                if (resource.mapDataToStore) {
                    resource.mapDataToStore(json, resource.recordType, this.store);
                }
                return json;
            }
            return await response.text();
        } catch (error) {
            if (error instanceof Response) {
                throw error;
            }
            throw new Error(error);
        }
    }
}