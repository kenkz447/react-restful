"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Resource {
    constructor(props) {
        this.recordType = props.resourceType || null;
        this.url = props.url;
        this.method = props.method || 'GET';
        this.mapDataToStore = props.mapDataToStore;
        this.afterFetch = props.afterFetch;
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
exports.Resource = Resource;
