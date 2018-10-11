"use strict";
// tslint:disable:no-any
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
        /**
         * Function to make request by fetch method.
         * @param resource - Resource instance
         * @param {RequestParameter[] | RequestParameter} [params] - Array or a single RequestParameter object,
         * @param {Meta} [meta] - Anything, get it back in these hooks after fetch.
         */
        this.fetchResource = (resource, params, meta) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { entry, store, beforeFetch, afterFetch, requestBodyParser, getResponseData } = this.props;
                const requestParams = Array.isArray(params) ?
                    params :
                    (params && [params]);
                let url = resource.urlReslover(requestParams);
                if (entry && url.startsWith('/')) {
                    url = entry + url;
                }
                const usedRequestBodyParser = resource.requestBodyParser || requestBodyParser;
                const requestInit = resource.requestInitReslover(requestParams, usedRequestBodyParser) ||
                    this.createDefaultRequestInit();
                requestInit.method = resource.method;
                const modifiedRequestInit = beforeFetch ? yield beforeFetch(url, requestInit) : requestInit;
                const response = yield fetch(url, modifiedRequestInit);
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
                    const usedGetResponseData = resource.getResponseData || getResponseData;
                    const responseData = usedGetResponseData ?
                        yield usedGetResponseData(response) :
                        yield response.json();
                    if (resource.mapDataToStore && resource.recordType) {
                        const resourceTypeHasRegistered = store.resourceTypeHasRegistered(resource.recordType.name);
                        if (!resourceTypeHasRegistered) {
                            store.registerRecord(resource.recordType);
                        }
                        resource.mapDataToStore(responseData, resource.recordType, store, requestInfo);
                    }
                    return responseData;
                }
                const responseText = yield response.text();
                return responseText;
            }
            catch (error) {
                throw error;
            }
        });
        this.props = Object.assign({}, props);
    }
}
exports.Fetcher = Fetcher;
