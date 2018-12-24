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
const SchemaError_1 = require("./SchemaError");
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
        this.getRequestUrl = (resource, requestParams, requestInit) => {
            const { entry, requestUrlParamParser } = this.props;
            let requestUrl = resource.urlReslover(requestParams, requestUrlParamParser);
            if (entry && requestUrl.startsWith('/')) {
                let entryURL = typeof entry === 'function' ?
                    entry(requestUrl, requestInit) :
                    entry;
                requestUrl = entryURL + requestUrl;
            }
            return requestUrl;
        };
        /**
         * Function to make request by fetch method.
         * @param resource - Resource instance
         * @param {RequestParams} [params] - Array or a single RequestParameter object,
         * @param {Meta} [meta] - Anything, get it back in these hooks after fetch.
         */
        this.fetchResource = (resource, params, meta) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield SchemaError_1.SchemaError.requestValidate(resource, params);
            }
            catch (error) {
                const { onSchemaError } = this.props;
                if (onSchemaError) {
                    onSchemaError(error, resource);
                }
                throw error;
            }
            const { store, beforeFetch, onRequestSuccess, requestBodyParser, onRequestFailed, onRequestError, fetchMethod, defaultMapDataToStore } = this.props;
            const resourceProps = resource.props;
            const requestParams = Array.isArray(params) ?
                params :
                (params && [params]);
            const usedRequestBodyParser = resourceProps.requestBodyParser || requestBodyParser;
            const requestInit = resource.requestInitReslover(requestParams, usedRequestBodyParser) ||
                this.createDefaultRequestInit();
            requestInit.method = resourceProps.method;
            const requestUrl = this.getRequestUrl(resource, requestParams, requestInit);
            const modifiedRequestInit = beforeFetch ? yield beforeFetch(requestUrl, requestInit) : requestInit;
            let response;
            const useFetchMethod = fetchMethod || fetch;
            try {
                response = yield useFetchMethod(requestUrl, modifiedRequestInit);
            }
            catch (error) {
                if (onRequestError) {
                    throw onRequestError(requestUrl, modifiedRequestInit, error);
                }
                throw error;
            }
            const requestMeta = resourceProps.getDefaultMeta ?
                resourceProps.getDefaultMeta(requestParams) :
                meta;
            const requestInfo = {
                meta: requestMeta,
                params: requestParams,
                response,
                resource
            };
            if (!response.ok) {
                if (resourceProps.onRequestFailed) {
                    throw yield resourceProps.onRequestFailed(requestInfo);
                }
                if (onRequestFailed) {
                    throw yield onRequestFailed(requestInfo);
                }
                throw response;
            }
            if (onRequestSuccess) {
                onRequestSuccess(requestInfo);
            }
            const responseContentType = response.headers.get('content-type');
            if (!responseContentType || !responseContentType.startsWith('application/json')) {
                const text = yield response.text();
                return { text };
            }
            const usedGetResponseData = resourceProps.getResponseData;
            const responseData = usedGetResponseData ?
                yield usedGetResponseData(requestInfo) :
                yield response.json();
            if (resourceProps.onRequestSuccess) {
                resourceProps.onRequestSuccess(requestInfo);
            }
            if (resourceProps.resourceType) {
                if (resourceProps.mapDataToStore) {
                    resourceProps.mapDataToStore(responseData, resourceProps.resourceType, store);
                }
                else if (defaultMapDataToStore) {
                    defaultMapDataToStore(responseData, resource, resourceProps.resourceType, store);
                }
            }
            return responseData;
        });
        this.props = Object.assign({}, props);
    }
}
exports.Fetcher = Fetcher;
