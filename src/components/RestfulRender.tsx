import React from 'react';
import {
    Resource,
    ResourceParameter,
    Store
} from '../utilities';
import { Fetcher } from '../utilities/Fetcher';

export interface RestfulComponentRenderProps<DataModel> {
    data?: DataModel | null;
    error?: Error | null;
}

export interface RestfulRenderProps<DataModel> {
    store: Store;
    resource: Resource<DataModel>;
    parameters: Array<ResourceParameter>;
    render: React.ComponentType<RestfulComponentRenderProps<DataModel>>;
}

export interface RestfulRenderState<DataModel> extends RestfulRenderProps<DataModel> {
    fetcher: Fetcher;
    componentRenderProps: RestfulComponentRenderProps<DataModel>;
}

export class RestfulRender<T> extends React.PureComponent<RestfulRenderProps<T>, RestfulRenderState<T>> {

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
                componentRenderProps: prevState.componentRenderProps
            };
        }

        return null;
    }

    constructor(props: RestfulRenderProps<T>) {
        super(props);
        this.state = {
            ...props,
            fetcher: new Fetcher({ store: this.props.store }),
            componentRenderProps: {
                data: null,
                error: null
            }
        };
    }

    componentDidMount() {
        this.state.fetcher.fetchResource<T>(this.state.resource, this.state.parameters)
            .then((data: T) => {
                this.setState({
                    componentRenderProps: {
                        data: data,
                        error: null
                    }
                });
            }).catch((error: Error) => {
                this.setState({
                    componentRenderProps: {
                        data: null,
                        error: error
                    }
                });
            });
    }

    render() {
        const Component = this.state.render;
        return <Component {...this.state.componentRenderProps} />;
    }
}