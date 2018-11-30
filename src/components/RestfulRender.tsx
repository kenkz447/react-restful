import * as React from 'react';
import {
    Resource,
    Fetcher,
    fetcherSymbol,
    RequestParams
} from '../utilities';

export interface RestfulRenderChildProps<DataModel> {
    // Resonse result, default: null
    data: DataModel | null;

    // Request catched error, default: null
    error: Error | null;

    // RestfulRender fetch status, default: true
    fetching?: boolean;

    refetch: () => void;
}

export type RestfulRenderChildType<DataModel> = React.ComponentType<RestfulRenderChildProps<DataModel>>;

// RestfulRender's props, don't care about <DataModel>
// Pick one of render or children (based on your interests) for Presenter component
export interface RestfulRenderProps<DataModel> {
    // For user who don't wants use default Fetcher, others: don't use it
    fetcher?: Fetcher;

    resource: Resource<DataModel>;

    parameters?: RequestParams;

    // Presenter component
    render?: RestfulRenderChildType<DataModel>;

    // Like `render` prop but in children style
    children?: RestfulRenderChildType<DataModel>;

    onFetchCompleted?: (data: DataModel) => void;

    defaultData?: DataModel;
}

export interface RestfulRenderState<DataModel> extends RestfulRenderProps<DataModel> {
    prevParams?: RequestParams;
    needsUpdate?: boolean;
    fetching: boolean;
    componentRenderProps: RestfulRenderChildProps<DataModel>;
}

export class RestfulRender<T> extends React.Component<RestfulRenderProps<T>, RestfulRenderState<T>> {
    static defaultProps = {
        parameters: []
    };

    // tslint:disable-next-line:no-any
    Component: RestfulRenderChildType<T>;

    static getDerivedStateFromProps<DataModel>(
        nextProps: RestfulRenderProps<DataModel>,
        prevState: RestfulRenderState<DataModel>): RestfulRenderState<DataModel> | null {

        const isResourceChanged = nextProps.resource !== prevState.resource;
        const isParamsChanged = JSON.stringify(nextProps.parameters) !== JSON.stringify(prevState.parameters);

        if (isResourceChanged || isParamsChanged) {
            return {
                ...nextProps,
                prevParams: prevState.parameters,
                componentRenderProps: prevState.componentRenderProps,
                needsUpdate: true,
                fetching: true
            };
        }

        return null;
    }

    constructor(props: RestfulRenderProps<T>) {
        super(props);

        const { children, render, defaultData } = props;

        if (!children && !render) {
            throw new Error('`children` or `render` required!');
        }

        this.Component = children || render!;
        const needsFetching = !defaultData;

        this.state = {
            ...props,
            fetcher: props.fetcher || global[fetcherSymbol],
            fetching: needsFetching,
            componentRenderProps: {
                data: defaultData || null,
                error: null,
                refetch: this.fetching
            }
        };

        if (needsFetching) {
            this.fetching();
        }
    }

    componentDidUpdate() {
        const { needsUpdate, fetching } = this.state;
        if (needsUpdate && fetching) {
            this.fetching();
        }
    }

    render() {
        const { componentRenderProps, fetching } = this.state;

        const { Component } = this;

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

    async fetching() {
        const { fetcher, resource, parameters, onFetchCompleted, componentRenderProps } = this.state;

        try {
            const data = await fetcher!.fetchResource<T>(resource, parameters);

            if (onFetchCompleted) {
                onFetchCompleted(data);
            }

            this.setState({
                needsUpdate: false,
                fetching: false,
                componentRenderProps: {
                    data: data,
                    error: null,
                    refetch: this.fetching
                }
            });
        } catch (error) {
            this.setState({
                fetching: false,
                componentRenderProps: {
                    data: componentRenderProps.data,
                    error: error,
                    refetch: this.fetching
                }
            });
        }
    }
}