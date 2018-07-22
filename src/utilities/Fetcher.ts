import { RecordType } from './RecordTable';
import { Resource, ResourceParameter, ResourceProps } from './Resource';
import { Store } from './Store';
import { ResourceType } from './ResourceType';
interface FetcherProps {
    store: Store;
}
export class Fetcher {
    store: Store;

    constructor(props: FetcherProps) {
        this.store = props.store;
    }

    fetch(url: string, requestInit: RequestInit) {
        return fetch(url, requestInit);
    }

    async fetchResource<DataModel>(resource: Resource<DataModel>, params: ResourceParameter[]) {
        try {
            const url = resource.urlReslover(params);
            const fetchInit = resource.requestInitReslover(params);

            const response = await this.fetch(url, fetchInit as RequestInit);

            if (!response.ok) {
                const responseText = await response.text();
                throw responseText;
            } else {
                if (response.headers.get('content-type') === 'application/json') {
                    const json = await response.json();
                    if (resource.mapDataToStore) {
                        resource.mapDataToStore(json, resource.recordType, this.store);
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