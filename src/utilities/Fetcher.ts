import { Resource, ResourceParameter } from './Resource';
import { Store } from './Store';

interface FetcherProps {
    store: Store;
    beforeFetch: (url: string, requestInit: RequestInit) => RequestInit;
    afterFetch: (response: Response) => void;
}

export class Fetcher {
    props: FetcherProps;
    createDefaultRequestInit = () => ({ headers: new Headers() });

    constructor(props: FetcherProps) {
        this.props = props;
    }

    fetch(url: string, requestInit: RequestInit) {
        return fetch(url, requestInit);
    }

    async fetchResource<DataModel>(resource: Resource<DataModel>, params: ResourceParameter[]) {
        try {
            const { store, beforeFetch, afterFetch } = this.props;

            const url = resource.urlReslover(params);

            const requestInit: RequestInit =
                resource.requestInitReslover(params) ||
                this.createDefaultRequestInit();

            requestInit.method = resource.method;

            const modifiedRequestInit = await beforeFetch(url, requestInit);
            const response = await this.fetch(url, modifiedRequestInit);

            await afterFetch(response);

            if (!response.ok) {
                throw response;
            }

            const responseContentType = response.headers.get('content-type');
            if (responseContentType && responseContentType.startsWith('application/json')) {
                const json = await response.json();
                if (resource.mapDataToStore) {
                    resource.mapDataToStore(json, resource.recordType, store);
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