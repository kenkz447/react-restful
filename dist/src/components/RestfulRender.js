"use strict";
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
        this.state = Object.assign({}, props, { fetcher: props.fetcher || global[utilities_1.fetcherSymbol], fetching: true, componentRenderProps: {
                data: null,
                error: null
            } });
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.resource !== prevState.resource ||
            nextProps.parameters !== prevState.parameters) {
            return Object.assign({}, nextProps, { componentRenderProps: prevState.componentRenderProps, needsUpdate: true, fetching: true });
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
        const { children } = this.props;
        const { render, componentRenderProps, fetching } = this.state;
        const Component = children || render;
        if (!Component) {
            return null;
        }
        const componentProps = Object.assign({}, componentRenderProps, { fetching: fetching });
        return (React.createElement(Component, Object.assign({}, componentProps)));
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
