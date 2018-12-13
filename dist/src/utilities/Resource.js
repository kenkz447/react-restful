"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shouldParmeterIgnore = (param) => !param || param.type === 'body' || param.value === undefined || param.value === '';
class Resource {
    constructor(props) {
        this.mixinWithDefaultParams = (requestParams) => {
            let params = this.props.getDefaultParams(requestParams);
            if (Array.isArray(params)) {
                return [...requestParams, ...params];
            }
            return [...requestParams, params];
        };
        this.urlReslover = (params = [], parser) => {
            const { getDefaultParams, url } = this.props;
            let uRL = url;
            const searchs = new URLSearchParams();
            const mixedRequestParams = getDefaultParams ? this.mixinWithDefaultParams(params) : params;
            for (const param of mixedRequestParams) {
                const ignore = shouldParmeterIgnore(param);
                if (ignore) {
                    continue;
                }
                const paramValue = parser ? parser(param.value, param) : param.value;
                if (param.type === 'path') {
                    uRL = uRL.replace(`/:${param.parameter}`, `/${paramValue}`);
                }
                else {
                    searchs.append(param.parameter, paramValue);
                }
            }
            const searchString = searchs.toString();
            return searchString ? `${uRL}?${searchString}` : uRL;
        };
        if (typeof props === 'string') {
            this.props = {
                url: Resource.getUrl(props),
                method: 'GET'
            };
        }
        else {
            this.props = Object.assign({}, props, { resourceType: props.resourceType, url: Resource.getUrl(props.url), method: props.method || 'GET' });
        }
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
            method: this.props.method
        };
        if (!bodyParam.contentType &&
            requestInit.headers instanceof Headers) {
            requestInit.headers.set('Content-Type', 'application/json');
        }
        return requestInit;
    }
}
/**
 * Ensure url will start with '/'
 */
Resource.getUrl = (url) => url.startsWith('http') ? url : (url.startsWith('/') ? url : `/${url}`);
exports.Resource = Resource;
