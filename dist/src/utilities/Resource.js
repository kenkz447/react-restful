"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Resource {
    constructor(props) {
        if (typeof props === 'string') {
            this.recordType = null;
            this.url = props;
            this.method = 'GET';
        }
        else {
            this.recordType = props.resourceType || null;
            this.url = props.url;
            this.method = props.method || 'GET';
            this.mapDataToStore = props.mapDataToStore;
            if (!this.mapDataToStore && props.resourceType) {
                this.mapDataToStore = Resource.defaultMapDataToStore(this);
            }
            this.requestFailed = props.requestFailed;
        }
    }
    urlReslover(params = []) {
        let uRL = this.url;
        const searchs = new URLSearchParams();
        for (const param of params) {
            if (!param || param.type === 'body' || param.value === undefined) {
                continue;
            }
            if (param.type === 'path') {
                uRL = uRL.replace(`/:${param.parameter}`, `/${param.value}`);
            }
            else {
                searchs.append(param.parameter, param.value);
            }
        }
        const searchString = searchs.toString();
        return searchString ? `${uRL}?${searchString}` : uRL;
    }
    requestInitReslover(params = []) {
        const body = params.find(param => param.type === 'body');
        if (!body) {
            return null;
        }
        const requestInit = {
            headers: new Headers({
                'Content-Type': body.contentType
            }),
            body: JSON.stringify(body.value),
            method: this.method
        };
        if (!body.contentType) {
            requestInit.headers.set('Content-Type', 'application/json');
        }
        return requestInit;
    }
}
// tslint:disable-next-line:no-any
Resource.defaultMapDataToStore = (resource) => (data, resourceType, store) => {
    if (Array.isArray(data)) {
        for (const record of data) {
            store.mapRecord(resourceType, record);
        }
    }
    else {
        const hasKey = resourceType.getRecordKey(data);
        if (!hasKey) {
            return;
        }
        if (resource.method === 'DELETE') {
            store.removeRecord(resourceType, data);
        }
        else {
            store.mapRecord(resourceType, data);
        }
    }
};
exports.Resource = Resource;
