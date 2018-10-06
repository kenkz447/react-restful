"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Fetcher {
    constructor(props) {
        this.createDefaultRequestInit = () => ({ headers: new Headers() });
        this.props = Object.assign({}, props);
    }
    fetch(url, requestInit) {
        return fetch(url, requestInit);
    }
    fetchResource(resource, params, meta) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { entry, store, beforeFetch, afterFetch, bodyStringify } = this.props;
                const requestParams = Array.isArray(params) ?
                    params :
                    (params && [params]);
                let url = resource.urlReslover(requestParams);
                if (entry) {
                    url = entry + url;
                }
                const requestInit = resource.requestInitReslover(requestParams, bodyStringify) ||
                    this.createDefaultRequestInit();
                requestInit.method = resource.method;
                const modifiedRequestInit = beforeFetch ? yield beforeFetch(url, requestInit) : requestInit;
                const response = yield this.fetch(url, modifiedRequestInit);
                const requestInfo = {
                    meta,
                    params: requestParams,
                    response
                };
                if (afterFetch) {
                    yield afterFetch(response);
                }
                if (!response.ok) {
                    if (resource.requestFailed) {
                        resource.requestFailed(requestInfo);
                    }
                    throw response;
                }
                const responseContentType = response.headers.get('content-type');
                if (responseContentType && responseContentType.startsWith('application/json')) {
                    const json = yield response.json();
                    if (resource.mapDataToStore && resource.recordType) {
                        const resourceTypeHasRegistered = store.resourceTypeHasRegistered(resource.recordType.name);
                        if (!resourceTypeHasRegistered) {
                            store.registerRecord(resource.recordType);
                        }
                        resource.mapDataToStore(json, resource.recordType, store, requestInfo);
                    }
                    return json;
                }
                const responseText = yield response.text();
                return responseText;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.Fetcher = Fetcher;
