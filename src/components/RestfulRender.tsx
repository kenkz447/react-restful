import React from 'react';
import {
    Resource,
    ResourceParameter,
    Store,
    Fetcher
} from '../utilities';

export interface RestfulComponentRenderProps<DataModel> {
    data?: DataModel | null;
    error?: Error | null;
    fetching?: boolean;
}

export interface RestfulRenderProps<DataModel> {
    store: Store;
    resource: Resource<DataModel>;
    parameters?: Array<ResourceParameter>;
    render: React.ComponentType<RestfulComponentRenderProps<DataModel>>;
    fetcher?: Fetcher;
    needsUpdate?: boolean;
    fetching?: boolean;
    onFetchCompleted?: (data: DataModel) => void;
}

export interface RestfulRenderState<DataModel> extends RestfulRenderProps<DataModel> {
    fetcher: Fetcher;
    componentRenderProps: RestfulComponentRenderProps<DataModel>;
}

export class RestfulRender<T> extends React.Component<RestfulRenderProps<T>, RestfulRenderState<T>> {
    static defaultProps: Partial<RestfulRenderProps<{}>> = {
        parameters: []
    };

    static getDerivedStateFromProps<DataModel>(
        nextProps: RestfulRenderProps<DataModel>,
        prevState: RestfulRenderState<DataModel>): RestfulRenderState<DataModel> | null {
        if (nextProps.resource !== prevState.resource ||
            nextProps.render !== prevState.render ||
            nextProps.parameters !== prevState.parameters
        ) {
            return {
                ...nextProps,
                fetcher: prevState.fetcher,
                componentRenderProps: prevState.componentRenderProps,
                needsUpdate: true,
                fetching: true
            };
        }
        if (nextProps.render !== prevState.render) {
            return {
                ...prevState,
                ...nextProps,
                needsUpdate: true
            };
        }
        return null;
    }

    constructor(props: RestfulRenderProps<T>) {
        super(props);
        this.state = {
            ...props,
            fetcher: this.props.fetcher || new Fetcher({ store: this.props.store }),
            fetching: false,
            componentRenderProps: {
                data: null,
                error: null
            }
        };
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
        return (
            <Component
                {...this.state.componentRenderProps}
                fetching={this.state.fetching}
            />
        );
    }

    fetching() {
        const { fetcher, resource, parameters, onFetchCompleted } = this.state;
        fetcher.fetchResource<T>(resource, parameters)
            .then((data: T) => {
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
            }).catch((error: Error) => {
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