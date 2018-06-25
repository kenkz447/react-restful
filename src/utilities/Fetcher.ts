import { RecordType } from './RecordTable';
import { Resource, ResourceParameter, ResourceProps } from './Resource';
import { Store } from './Store';
interface FetcherProps {
    store: Store;
}
export class Fetcher<T> {
    store: Store;

    constructor(props: FetcherProps) {
        this.store = props.store;
    }

    fetch(url: string, requestInit: RequestInit) {
        return fetch(url, requestInit);
    }

    async fetchResource(resource: Resource<T>, params: ResourceParameter[]) {
        try {
            const url = resource.urlReslover(params);
            const fetchInit = resource.requestInitReslover(params);

            const response = await this.fetch(url, fetchInit as RequestInit);

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(responseText);
            }

            if (response.status === 200) {
                if (response.headers.get('content-type') === 'application/json') {
                    const json = await response.json();
                    const recordType = this.store.getRegisteredResourceType(resource.recordType.name);
                    if (resource.mapDataToStore) {
                        resource.mapDataToStore(json, recordType, this.store);
                    }
                    return json;
                }
                return await response.text();
            }
        } catch (error) {
            throw new Error(error);
        }
    }
}