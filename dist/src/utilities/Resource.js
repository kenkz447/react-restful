"use strict";
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var shouldParmeterIgnore = function (param) {
    return !param || param.type === 'body' || param.value === undefined || param.value === '';
};
var Resource = /** @class */ (function () {
    function Resource(props) {
        var _this = this;
        this.mixinWithDefaultParams = function (requestParams) {
            var params = _this.props.getDefaultParams(requestParams);
            if (Array.isArray(params)) {
                return __spread(requestParams, params);
            }
            return __spread(requestParams, [params]);
        };
        this.urlReslover = function (params, parser) {
            if (params === void 0) { params = []; }
            var e_1, _a;
            var _b = _this.props, getDefaultParams = _b.getDefaultParams, url = _b.url;
            var uRL = url;
            var searchs = new URLSearchParams();
            var mixedRequestParams = getDefaultParams ? _this.mixinWithDefaultParams(params) : params;
            try {
                for (var mixedRequestParams_1 = __values(mixedRequestParams), mixedRequestParams_1_1 = mixedRequestParams_1.next(); !mixedRequestParams_1_1.done; mixedRequestParams_1_1 = mixedRequestParams_1.next()) {
                    var param = mixedRequestParams_1_1.value;
                    var ignore = shouldParmeterIgnore(param);
                    if (ignore) {
                        continue;
                    }
                    var paramValue = parser ? parser(param.value, param) : param.value;
                    if (param.type === 'path') {
                        uRL = uRL.replace("/:" + param.parameter, "/" + paramValue);
                    }
                    else {
                        searchs.append(param.parameter, paramValue);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (mixedRequestParams_1_1 && !mixedRequestParams_1_1.done && (_a = mixedRequestParams_1.return)) _a.call(mixedRequestParams_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var searchString = searchs.toString();
            return searchString ? uRL + "?" + searchString : uRL;
        };
        if (typeof props === 'string') {
            this.props = {
                url: Resource.getUrl(props),
                method: 'GET'
            };
        }
        else {
            this.props = __assign({}, props, { resourceType: props.resourceType, url: Resource.getUrl(props.url), method: props.method || 'GET' });
        }
    }
    Resource.prototype.requestInitReslover = function (params, requestBodyParser) {
        if (params === void 0) { params = []; }
        var bodyParam = params.find(function (param) { return param.type === 'body'; });
        if (!bodyParam) {
            return null;
        }
        var body = bodyParam.value;
        var requestBody = __assign({}, body);
        if (requestBodyParser) {
            var bodyKeys = Object.keys(body);
            bodyKeys.forEach(function (bodyKey) {
                var element = body[bodyKey];
                requestBody[bodyKey] = requestBodyParser(bodyKey, element);
            });
        }
        var requestInit = {
            headers: new Headers({
                'Content-Type': bodyParam.contentType || 'application/json'
            }),
            body: JSON.stringify(requestBody),
            method: this.props.method
        };
        return requestInit;
    };
    /**
     * Ensure url will start with '/'
     */
    Resource.getUrl = function (url) { return url.startsWith('http') ? url : (url.startsWith('/') ? url : "/" + url); };
    return Resource;
}());
exports.Resource = Resource;
