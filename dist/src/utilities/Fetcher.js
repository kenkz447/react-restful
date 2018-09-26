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
        this.props = props;
    }
    fetch(url, requestInit) {
        return fetch(url, requestInit);
    }
    fetchResource(resource, params, meta) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { entry, store, beforeFetch, afterFetch } = this.props;
                let url = resource.urlReslover(params);
                if (entry) {
                    url = entry + url;
                }
                const requestInit = resource.requestInitReslover(params) ||
                    this.createDefaultRequestInit();
                requestInit.method = resource.method;
                const modifiedRequestInit = beforeFetch ? yield beforeFetch(url, requestInit) : requestInit;
                const response = yield this.fetch(url, modifiedRequestInit);
                if (afterFetch) {
                    yield afterFetch(response);
                }
                if (!response.ok) {
                    throw response;
                }
                const responseContentType = response.headers.get('content-type');
                if (responseContentType && responseContentType.startsWith('application/json')) {
                    const json = yield response.json();
                    if (resource.afterFetch) {
                        resource.afterFetch(params, json, meta, resource.recordType, store);
                    }
                    if (resource.mapDataToStore && resource.recordType) {
                        resource.mapDataToStore(json, resource.recordType, store);
                    }
                    return json;
                }
                const responseText = yield response.text();
                if (resource.afterFetch) {
                    // tslint:disable-next-line:no-any
                    resource.afterFetch(params, responseText, meta, resource.recordType, store);
                }
                return responseText;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.Fetcher = Fetcher;
