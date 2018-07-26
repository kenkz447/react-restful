"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var Fetcher_1 = require("../utilities/Fetcher");
var RestfulRender = /** @class */ (function (_super) {
    __extends(RestfulRender, _super);
    function RestfulRender(props) {
        var _this = _super.call(this, props) || this;
        _this.state = __assign({}, props, { fetcher: _this.props.fetcher || new Fetcher_1.Fetcher({ store: _this.props.store }), componentRenderProps: {
                data: null,
                error: null
            } });
        return _this;
    }
    RestfulRender.getDerivedStateFromProps = function (nextProps, prevState) {
        if (nextProps.resource !== prevState.resource ||
            nextProps.render !== prevState.render ||
            nextProps.parameters !== prevState.parameters) {
            return __assign({}, nextProps, { fetcher: prevState.fetcher, componentRenderProps: prevState.componentRenderProps });
        }
        return null;
    };
    RestfulRender.prototype.componentDidMount = function () {
        this.fetching();
    };
    RestfulRender.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.state.resource !== prevState.resource ||
            this.state.render !== prevState.render ||
            this.state.parameters !== prevState.parameters) {
            this.fetching();
        }
    };
    RestfulRender.prototype.render = function () {
        var Component = this.state.render;
        return react_1.default.createElement(Component, __assign({}, this.state.componentRenderProps));
    };
    RestfulRender.prototype.fetching = function () {
        var _this = this;
        this.state.fetcher.fetchResource(this.state.resource, this.state.parameters)
            .then(function (data) {
            _this.setState({
                componentRenderProps: {
                    data: data,
                    error: null
                }
            });
        }).catch(function (error) {
            _this.setState({
                componentRenderProps: {
                    data: null,
                    error: error
                }
            });
        });
    };
    return RestfulRender;
}(react_1.default.PureComponent));
exports.RestfulRender = RestfulRender;
