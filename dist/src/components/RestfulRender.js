"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const utilities_1 = require("../utilities");
class RestfulRender extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({}, props, { fetcher: this.props.fetcher || new utilities_1.Fetcher({ store: this.props.store }), fetching: false, componentRenderProps: {
                data: null,
                error: null
            } });
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.resource !== prevState.resource ||
            nextProps.render !== prevState.render ||
            nextProps.parameters !== prevState.parameters) {
            return Object.assign({}, nextProps, { fetcher: prevState.fetcher, componentRenderProps: prevState.componentRenderProps, needsUpdate: true, fetching: true });
        }
        if (nextProps.render !== prevState.render) {
            return Object.assign({}, prevState, nextProps, { needsUpdate: true });
        }
        return null;
    }
    componentDidMount() {
        this.fetching();
    }
    componentDidUpdate() {
        const { needsUpdate, fetching } = this.state;
        if (needsUpdate && fetching) {
            this.fetching();
        }
    }
    render() {
        const Component = this.state.render;
        return (react_1.default.createElement(Component, Object.assign({}, this.state.componentRenderProps, { fetching: this.state.fetching })));
    }
    fetching() {
        const { fetcher, resource, parameters, onFetchCompleted } = this.state;
        fetcher.fetchResource(resource, parameters)
            .then((data) => {
            if (onFetchCompleted) {
                onFetchCompleted(data);
            }
            this.setState({
                needsUpdate: false,
                fetching: false,
                componentRenderProps: {
                    data: data,
                    error: null
                }
            });
        }).catch((error) => {
            this.setState({
                fetching: false,
                componentRenderProps: {
                    data: null,
                    error: error
                }
            });
        });
    }
}
RestfulRender.defaultProps = {
    parameters: []
};
exports.RestfulRender = RestfulRender;
