"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const utilities_1 = require("../utilities");
class RestfulRender extends React.Component {
    constructor(props) {
        super(props);
        this.fetching = () => __awaiter(this, void 0, void 0, function* () {
            const { fetcher, resource, parameters, onFetchCompleted, componentRenderProps } = this.state;
            try {
                const data = yield fetcher.fetchResource(resource, parameters);
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
            }
            catch (error) {
                this.setState({
                    fetching: false,
                    componentRenderProps: {
                        data: componentRenderProps.data,
                        error: error,
                        refetch: this.fetching,
                        fetching: false
                    }
                });
            }
        });
        const { children, render, initData } = props;
        if (!children && !render) {
            throw new Error('`children` or `render` are required!');
        }
        this.Component = children || render;
        const needsFetching = !initData;
        this.state = Object.assign({}, props, { fetcher: props.fetcher || global[utilities_1.fetcherSymbol], fetching: needsFetching, componentRenderProps: {
                data: initData || null,
                error: null,
                refetch: this.fetching,
                fetching: needsFetching
            } });
        if (needsFetching) {
            this.fetching();
        }
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const isResourceChanged = nextProps.resource !== prevState.resource;
        const isParamsChanged = JSON.stringify(nextProps.parameters) !== JSON.stringify(prevState.parameters);
        if (isResourceChanged || isParamsChanged) {
            return Object.assign({}, nextProps, { prevParams: prevState.parameters, componentRenderProps: Object.assign({}, prevState.componentRenderProps, { fetching: true }), needsUpdate: true, fetching: true });
        }
        return null;
    }
    componentDidUpdate() {
        const { needsUpdate, fetching } = this.state;
        if (needsUpdate && fetching) {
            this.fetching();
        }
    }
    render() {
        const { componentRenderProps } = this.state;
        const { Component } = this;
        if (!Component) {
            return null;
        }
        return (React.createElement(Component, Object.assign({}, componentRenderProps)));
    }
}
RestfulRender.defaultProps = {
    parameters: []
};
exports.RestfulRender = RestfulRender;
