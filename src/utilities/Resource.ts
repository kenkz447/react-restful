import { Environment } from './Environment';

export interface ResourceProps {
    resourceType: string;
    url: string;
    method: string;
}

export interface ResourceParameters {
    parameter: string;
    value: Object | string | number;
    type: 'body' | 'path' | 'query';
    contentType?: string;
}

export class Resource<DataModel = {}> {
    recordType: string;
    url: string;
    method: string;
    environment!: Environment;

    constructor(props: ResourceProps) {
        this.recordType = props.resourceType;
        this.url = props.url;
        this.method = props.method;
    }

    setEnvironment(environment: Environment) {
        environment.store.registerRecordType(this.recordType);
        this.environment = environment;
    }

    async fetch(params: Array<ResourceParameters>): Promise<DataModel> {
        try {
            const url = this.urlReslover(params);
            const fetchInit = this.requestInitReslover(params);

            const response = await this.environment.fetch(url, fetchInit);

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(responseText);
            }

            const json: DataModel = await response.json();
            await this.mapRecordToStore(json);
            return json;
        } catch (error) {
            throw new Error(error);
        }
    }

    urlReslover(params: Array<ResourceParameters>): string {
        let uRL: string = this.url;
        const searchs: URLSearchParams = new URLSearchParams();
        for (const param of params) {
            if (param.type === 'body') {
                continue;
            }

            if (param.type === 'path') {
                uRL = uRL.replace(`{${param.parameter}}`, param.value as string);
            } else {
                searchs.append(param.parameter, param.value as string);
            }
        }

        return `${uRL}?${searchs.toString()}`;
    }

    requestInitReslover(params: Array<ResourceParameters>): RequestInit | null {
        if (!params) {
            return null;
        }

        const body: ResourceParameters = params.find(param => param.type === 'body') as ResourceParameters;

        if (!body) {
            return null;
        }

        const requestInit: RequestInit = {
            headers: new Headers({
                'Content-Type': body.contentType as string
            }),
            body: body.value as string,
            method: this.method
        };

        return requestInit;
    }

    mapRecordToStore(data: DataModel) {
        if (Array.isArray(data)) {
            for (const dataItem of data) {
                this.environment.store.mapRecord(this.recordType, dataItem);
            }
        } else {
            this.environment.store.mapRecord(this.recordType, data);
        }
    }
}