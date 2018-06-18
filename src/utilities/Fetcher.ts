import { RecordType } from './RecordTable';
import { Resource, ResourceParameter, ResourceProps } from './Resource';
import { Store } from './Store';
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

    async fetchResource(resource: Resource, params: ResourceParameter[]) {
        try {
            const url = resource.urlReslover(params);
            const fetchInit = resource.requestInitReslover(params);

            const response = await this.fetch(url, fetchInit as RequestInit);

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(responseText);
            }

            if (response.status === 200) {
                const json = await response.json();
                if (resource.mapRecordToStore !== undefined) {
                    resource.mapRecordToStore(json, this.store);
                }
                return json;
            }
        } catch (error) {
            throw new Error(error);
        }
    }
}