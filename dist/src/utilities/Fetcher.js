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
        this.onRequestConfirm = (confirmInfo) => __awaiter(this, void 0, void 0, function* () {
            const { onConfirm } = this.props;
            if (!onConfirm) {
                return true;
            }
            const confirmer = confirmInfo.resource.props.onConfirm || onConfirm;
            return yield confirmer(confirmInfo);
        });
        /**
         * Function to make request by fetch method.
         * @param resource - Resource instance
         * @param {RequestParams} [params] - Array or a single RequestParameter object,
         * @param {Meta} [meta] - Anything, get it back in these hooks after fetch.
         */
        this.fetchResource = (resource, params, meta) => __awaiter(this, void 0, void 0, function* () {
            const { entry, store, beforeFetch, afterFetch, requestBodyParser, getResponseData, requestFailed, unexpectedErrorCatched, fetchMethod } = this.props;
            const resourceProps = resource.props;
            const requestParams = Array.isArray(params) ?
                params :
                (params && [params]);
            let url = resource.urlReslover(requestParams);
            if (entry && url.startsWith('/')) {
                url = entry + url;
            }
            const usedRequestBodyParser = resourceProps.requestBodyParser || requestBodyParser;
            const requestInit = resource.requestInitReslover(requestParams, usedRequestBodyParser) ||
                this.createDefaultRequestInit();
            requestInit.method = resourceProps.method;
            const modifiedRequestInit = beforeFetch ? yield beforeFetch(url, requestInit) : requestInit;
            let response;
            const useFetchMethod = fetchMethod || fetch;
            try {
                response = yield useFetchMethod(url, modifiedRequestInit);
            }
            catch (error) {
                if (unexpectedErrorCatched) {
                    throw unexpectedErrorCatched(url, modifiedRequestInit, error);
                }
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error(error);
            }
            const requestMeta = resourceProps.getDefaultMeta ?
                resourceProps.getDefaultMeta(requestParams) :
                meta;
            const requestInfo = {
                meta: requestMeta,
                params: requestParams,
                response
            };
            if (!response.ok) {
                if (resourceProps.requestFailed) {
                    resourceProps.requestFailed(requestInfo);
                }
                if (requestFailed) {
                    requestFailed(requestInfo);
                }
                throw response;
            }
            if (afterFetch) {
                afterFetch(requestInfo);
            }
            const responseContentType = response.headers.get('content-type');
            if (responseContentType && responseContentType.startsWith('application/json')) {
                const usedGetResponseData = resourceProps.getResponseData || getResponseData;
                const responseData = usedGetResponseData ?
                    yield usedGetResponseData(requestInfo) :
                    yield response.json();
                if (resourceProps.requestSuccess) {
                    resourceProps.requestSuccess(requestInfo);
                }
                if (resourceProps.mapDataToStore && resourceProps.resourceType) {
                    const registeredResourceType = store.resourceTypeHasRegistered(resourceProps.resourceType.props.name);
                    if (!registeredResourceType) {
                        store.registerRecord(resourceProps.resourceType);
                    }
                    resourceProps.mapDataToStore(responseData, resourceProps.resourceType, store);
                }
                return responseData;
            }
            return yield response.text();
        });
        this.props = Object.assign({}, props);
    }
}
exports.Fetcher = Fetcher;
