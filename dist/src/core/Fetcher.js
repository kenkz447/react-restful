"use strict";
// tslint:disable:no-any
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var SchemaError_1 = require("./SchemaError");
var Fetcher = /** @class */ (function () {
    function Fetcher(props) {
        var _this = this;
        this.createDefaultRequestInit = function () { return ({ headers: new Headers() }); };
        this.onRequestConfirm = function (confirmInfo) { return __awaiter(_this, void 0, void 0, function () {
            var onConfirm, confirmer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onConfirm = this.props.onConfirm;
                        if (!onConfirm) {
                            return [2 /*return*/, true];
                        }
                        confirmer = confirmInfo.resource.props.onConfirm || onConfirm;
                        return [4 /*yield*/, confirmer(confirmInfo)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this.getRequestUrl = function (resource, requestParams, requestInit) {
            var _a = _this.props, entry = _a.entry, requestUrlParamParser = _a.requestUrlParamParser;
            var requestUrl = resource.urlReslover(requestParams, requestUrlParamParser);
            if (entry && requestUrl.startsWith('/')) {
                var entryURL = typeof entry === 'function' ?
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
        this.fetchResource = function (resource, params, meta) { return __awaiter(_this, void 0, void 0, function () {
            var error_1, onSchemaError, _a, store, beforeFetch, onRequestSuccess, requestBodyParser, onRequestFailed, onRequestError, fetchMethod, defaultMapDataToStore, resourceProps, requestParams, usedRequestBodyParser, requestInit, requestUrl, modifiedRequestInit, _b, response, useFetchMethod, error_2, requestMeta, requestInfo, responseContentType, usedGetResponseData, responseData, _c, innerKey, innerValue, innerMapper;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, SchemaError_1.SchemaError.requestValidate(resource, params)];
                    case 1:
                        _d.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _d.sent();
                        onSchemaError = this.props.onSchemaError;
                        if (onSchemaError) {
                            onSchemaError(error_1, resource);
                        }
                        throw error_1;
                    case 3:
                        _a = this.props, store = _a.store, beforeFetch = _a.beforeFetch, onRequestSuccess = _a.onRequestSuccess, requestBodyParser = _a.requestBodyParser, onRequestFailed = _a.onRequestFailed, onRequestError = _a.onRequestError, fetchMethod = _a.fetchMethod, defaultMapDataToStore = _a.defaultMapDataToStore;
                        resourceProps = resource.props;
                        requestParams = Array.isArray(params) ?
                            params :
                            (params && [params]);
                        usedRequestBodyParser = resourceProps.requestBodyParser || requestBodyParser;
                        requestInit = resource.requestInitReslover(requestParams, usedRequestBodyParser) ||
                            this.createDefaultRequestInit();
                        requestInit.method = resourceProps.method;
                        requestUrl = this.getRequestUrl(resource, requestParams, requestInit);
                        if (!beforeFetch) return [3 /*break*/, 5];
                        return [4 /*yield*/, beforeFetch(requestUrl, requestInit)];
                    case 4:
                        _b = _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _b = requestInit;
                        _d.label = 6;
                    case 6:
                        modifiedRequestInit = _b;
                        useFetchMethod = fetchMethod || fetch;
                        _d.label = 7;
                    case 7:
                        _d.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, useFetchMethod(requestUrl, modifiedRequestInit)];
                    case 8:
                        response = _d.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        error_2 = _d.sent();
                        if (onRequestError) {
                            throw onRequestError(requestUrl, modifiedRequestInit, error_2);
                        }
                        throw error_2;
                    case 10:
                        requestMeta = resourceProps.getDefaultMeta ?
                            resourceProps.getDefaultMeta(requestParams) :
                            meta;
                        requestInfo = {
                            meta: requestMeta,
                            params: requestParams,
                            response: response,
                            resource: resource
                        };
                        if (!!response.ok) return [3 /*break*/, 15];
                        if (!resourceProps.onRequestFailed) return [3 /*break*/, 12];
                        return [4 /*yield*/, resourceProps.onRequestFailed(requestInfo)];
                    case 11: throw _d.sent();
                    case 12:
                        if (!onRequestFailed) return [3 /*break*/, 14];
                        return [4 /*yield*/, onRequestFailed(requestInfo)];
                    case 13: throw _d.sent();
                    case 14: throw response;
                    case 15:
                        if (onRequestSuccess) {
                            onRequestSuccess(requestInfo);
                        }
                        responseContentType = response.headers.get('content-type');
                        if (!responseContentType || !responseContentType.startsWith('application/json')) {
                            return [2 /*return*/, response];
                        }
                        usedGetResponseData = resourceProps.getResponseData;
                        if (!usedGetResponseData) return [3 /*break*/, 17];
                        return [4 /*yield*/, usedGetResponseData(requestInfo)];
                    case 16:
                        _c = _d.sent();
                        return [3 /*break*/, 19];
                    case 17: return [4 /*yield*/, response.json()];
                    case 18:
                        _c = _d.sent();
                        _d.label = 19;
                    case 19:
                        responseData = _c;
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
                            if (resource.props.innerMapping) {
                                for (innerKey in responseData) {
                                    if (responseData.hasOwnProperty(innerKey)) {
                                        innerValue = responseData[innerKey];
                                        if (typeof innerValue !== 'object') {
                                            continue;
                                        }
                                        innerMapper = resource.props.innerMapping[innerKey];
                                        if (!innerMapper) {
                                            continue;
                                        }
                                        innerMapper(innerValue, store);
                                    }
                                }
                            }
                        }
                        return [2 /*return*/, responseData];
                }
            });
        }); };
        this.props = __assign({}, props);
    }
    return Fetcher;
}());
exports.Fetcher = Fetcher;
