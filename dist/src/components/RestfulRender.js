"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var utilities_1 = require("../utilities");
var RestfulRender = /** @class */ (function (_super) {
    __extends(RestfulRender, _super);
    function RestfulRender(props) {
        var _this = _super.call(this, props) || this;
        _this.fetching = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, fetcher, resource, parameters, onFetchCompleted, componentRenderProps, data, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.state, fetcher = _a.fetcher, resource = _a.resource, parameters = _a.parameters, onFetchCompleted = _a.onFetchCompleted, componentRenderProps = _a.componentRenderProps;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetcher.fetchResource(resource, parameters)];
                    case 2:
                        data = _b.sent();
                        if (onFetchCompleted) {
                            onFetchCompleted(data);
                        }
                        this.setState({
                            needsUpdate: false,
                            fetching: false,
                            componentRenderProps: {
                                data: data,
                                error: null,
                                refetch: this.fetching,
                                fetching: false
                            }
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        this.setState({
                            fetching: false,
                            componentRenderProps: {
                                data: componentRenderProps.data,
                                error: error_1,
                                refetch: this.fetching,
                                fetching: false
                            }
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        var render = props.render, initData = props.initData, initFetch = props.initFetch;
        _this.Component = render;
        var needsFetching = initFetch || !initData;
        _this.state = __assign({}, props, { fetcher: props.fetcher || global[utilities_1.fetcherSymbol], fetching: needsFetching, componentRenderProps: {
                data: initData || null,
                error: null,
                refetch: _this.fetching,
                fetching: needsFetching
            } });
        if (needsFetching) {
            _this.fetching();
        }
        return _this;
    }
    RestfulRender.getDerivedStateFromProps = function (nextProps, prevState) {
        var isResourceChanged = nextProps.resource !== prevState.resource;
        var isParamsChanged = JSON.stringify(nextProps.parameters) !== JSON.stringify(prevState.parameters);
        if (isResourceChanged || isParamsChanged) {
            return __assign({}, nextProps, { prevParams: prevState.parameters, componentRenderProps: __assign({}, prevState.componentRenderProps, { fetching: true }), needsUpdate: true, fetching: true });
        }
        return null;
    };
    RestfulRender.prototype.componentDidUpdate = function () {
        var _a = this.state, needsUpdate = _a.needsUpdate, fetching = _a.fetching;
        if (needsUpdate && fetching) {
            this.fetching();
        }
    };
    RestfulRender.prototype.render = function () {
        var componentRenderProps = this.state.componentRenderProps;
        var children = this.props.children;
        var Component = this.Component;
        if (Component) {
            return React.createElement(Component, __assign({}, componentRenderProps));
        }
        if (children) {
            return children(componentRenderProps);
        }
        throw new Error('Missing render!');
    };
    RestfulRender.defaultProps = {
        parameters: []
    };
    return RestfulRender;
}(React.Component));
exports.RestfulRender = RestfulRender;
