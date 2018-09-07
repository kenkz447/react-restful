"use strict";
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
var Resource = /** @class */ (function () {
    function Resource(props) {
        this.recordType = props.resourceType;
        this.url = props.url;
        this.method = props.method;
        this.mapDataToStore = props.mapDataToStore;
        this.afterFetch = props.afterFetch;
    }
    Resource.prototype.urlReslover = function (params) {
        var e_1, _a;
        var uRL = this.url;
        var searchs = new URLSearchParams();
        try {
            for (var params_1 = __values(params), params_1_1 = params_1.next(); !params_1_1.done; params_1_1 = params_1.next()) {
                var param = params_1_1.value;
                if (!param || param.type === 'body') {
                    continue;
                }
                if (param.type === 'path') {
                    uRL = uRL.replace("/:" + param.parameter, "/" + param.value);
                }
                else {
                    searchs.append(param.parameter, param.value);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (params_1_1 && !params_1_1.done && (_a = params_1.return)) _a.call(params_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return uRL + "?" + searchs.toString();
    };
    Resource.prototype.requestInitReslover = function (params) {
        if (!params) {
            return null;
        }
        var body = params.find(function (param) { return param.type === 'body'; });
        if (!body) {
            return null;
        }
        var requestInit = {
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
    };
    return Resource;
}());
exports.Resource = Resource;
