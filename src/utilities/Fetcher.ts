import { Resource, ResourceParameter } from './Resource';
import { Store } from './Store';

export interface RequestInfo<Meta> {
    meta?: Meta;
    params?: ResourceParameter[];
    response: Response;
}

export interface FetcherProps {
    store: Store;
    entry?: string;
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
            const { entry, store, beforeFetch, afterFetch } = this.props;

            let url = resource.urlReslover(params);
            if (entry) {
                url = entry + url;
            }

            const requestInit: RequestInit =
                resource.requestInitReslover(params) ||
                this.createDefaultRequestInit();

            requestInit.method = resource.method;

            const modifiedRequestInit = beforeFetch ? await beforeFetch(url, requestInit) : requestInit;
            const response = await this.fetch(url, modifiedRequestInit);

            const requestInfo: RequestInfo<Meta> = {
                meta,
                params,
                response
            };

            if (afterFetch) {
                await afterFetch(response);
            }

            if (!response.ok) {
                if (resource.requestFailed) {
                    resource.requestFailed(requestInfo);
                }

                throw response;
            }

            const responseContentType = response.headers.get('content-type');
            if (responseContentType && responseContentType.startsWith('application/json')) {
                const json = await response.json();

                if (resource.mapDataToStore && resource.recordType) {
                    const resourceTypeHasRegistered = store.resourceTypeHasRegistered(resource.recordType.name);
                    if (!resourceTypeHasRegistered) {
                        store.registerRecordType(resource.recordType);
                    }

                    resource.mapDataToStore(json, resource.recordType, store, requestInfo);
                }
                return json;
            }
            const responseText = await response.text();
            return responseText;
        } catch (error) {
            throw error;
        }
    }
}