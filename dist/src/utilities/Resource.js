"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shouldParmeterIgnore = (param) => !param || param.type === 'body' || param.value === undefined || param.value === '';
class Resource {
    constructor(props) {
        if (typeof props === 'string') {
            this.recordType = null;
            this.url = Resource.getUrl(props);
            this.method = 'GET';
        }
        else {
            this.recordType = props.resourceType || null;
            this.url = Resource.getUrl(props.url);
            this.method = props.method || 'GET';
            this.mapDataToStore = props.mapDataToStore;
            if (!this.mapDataToStore && props.resourceType) {
                this.mapDataToStore = Resource.defaultMapDataToStore(this);
            }
            this.requestBodyParser = props.requestBodyParser;
            this.requestFailed = props.requestFailed;
            this.requestSuccess = props.requestSuccess;
            this.onConfirm = props.onConfirm;
        }
    }
    urlReslover(params = []) {
        let uRL = this.url;
        const searchs = new URLSearchParams();
        for (const param of params) {
            const ignore = shouldParmeterIgnore(param);
            if (ignore) {
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
    requestInitReslover(params = [], requestBodyParser) {
        const bodyParam = params.find(param => param.type === 'body');
        if (!bodyParam) {
            return null;
        }
        const body = bodyParam.value;
        let convertedBody = null;
        if (requestBodyParser) {
            convertedBody = {};
            for (const key in body) {
                if (body.hasOwnProperty(key)) {
                    const element = body[key];
                    convertedBody[key] = requestBodyParser(key, element);
                }
            }
        }
        const requestInit = {
            headers: new Headers({
                'Content-Type': bodyParam.contentType
            }),
            body: JSON.stringify(convertedBody || body),
            method: this.method
        };
        if (!bodyParam.contentType &&
            requestInit.headers instanceof Headers) {
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
/**
 * Ensure url will start with '/'
 */
Resource.getUrl = (url) => url.startsWith('/') ? url : `/${url}`;
exports.Resource = Resource;
