import * as React from 'react';
import {
    Resource,
    ResourceParameter,
    Fetcher,
    fetcherSymbol
} from '../utilities';

export interface RestfulComponentRenderProps<DataModel> {
    data?: DataModel | null;
    error?: Error | null;
    fetching?: boolean;
}

export interface RestfulRenderProps<DataModel> {
    fetcher?: Fetcher;
    resource: Resource<DataModel>;
    parameters?: Array<ResourceParameter> | ResourceParameter;

    render?: React.ComponentType<RestfulComponentRenderProps<DataModel>>;

    children?: React.ComponentType<RestfulComponentRenderProps<DataModel>>;
    onFetchCompleted?: (data: DataModel) => void;
}

export interface RestfulRenderState<DataModel> extends RestfulRenderProps<DataModel> {
    needsUpdate?: boolean;
    fetching?: boolean;
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
            nextProps.parameters !== prevState.parameters
        ) {
            return {
                ...nextProps,
                componentRenderProps: prevState.componentRenderProps,
                needsUpdate: true,
                fetching: true
            };
        }

        return null;
    }

    constructor(props: RestfulRenderProps<T>) {
        super(props);
        this.state = {
            ...props,
            fetcher: props.fetcher || global[fetcherSymbol],
            fetching: true,
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
        const { children } = this.props;
        const { render, componentRenderProps, fetching } = this.state;

        const Component = children || render;

        if (!Component) {
            return null;
        }

        const componentProps = {
            ...componentRenderProps,
            fetching: fetching
        };

        return (
            <Component {...componentProps} />
        );
    }

    fetching() {
        const { fetcher, resource, parameters, onFetchCompleted } = this.state;
        fetcher!.fetchResource<T>(resource, parameters)
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