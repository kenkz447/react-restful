import { Resource, ResourceParameter } from './Resource';
import { Store } from './Store';

interface FetcherProps {
    store: Store;
    beforeFetch?: (url: string, requestInit: RequestInit) => RequestInit;
    afterFetch?: (response: Response) => void;
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

    async fetchResource<DataModel, Meta = {}>(
        resource: Resource<DataModel>,
        params?: ResourceParameter[],
        meta?: Meta
    ) {
        try {
            const { store, beforeFetch, afterFetch } = this.props;

            const url = resource.urlReslover(params);

            const requestInit: RequestInit =
                resource.requestInitReslover(params) ||
                this.createDefaultRequestInit();

            requestInit.method = resource.method;

            const modifiedRequestInit = beforeFetch ? await beforeFetch(url, requestInit) : requestInit;
            const response = await this.fetch(url, modifiedRequestInit);

            if (afterFetch) {
                await afterFetch(response);
            }

            if (!response.ok) {
                throw response;
            }

            const responseContentType = response.headers.get('content-type');
            if (responseContentType && responseContentType.startsWith('application/json')) {
                const json = await response.json();
                if (resource.afterFetch) {
                    resource.afterFetch(params, json, meta);
                }

                if (resource.mapDataToStore) {
                    resource.mapDataToStore(json, resource.recordType, store);
                }
                return json;
            }
            const responseText = await response.text();
            if (resource.afterFetch) {
                // tslint:disable-next-line:no-any
                resource.afterFetch(params, responseText as any, meta);
            }
            return responseText;
        } catch (error) {
            if (error instanceof Response) {
                throw error;
            }
            throw new Error(error);
        }
    }
}