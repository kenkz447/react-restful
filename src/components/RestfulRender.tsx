import * as React from 'react';
import {
    Resource,
    Fetcher,
    fetcherSymbol,
    RequestParams
} from '../core';

export interface RestfulRenderChildProps<R> {
    // Resonse result, default: null
    data: R | null;

    // Request catched error, default: null
    error: Error | null;

    // RestfulRender fetch status, default: true
    fetching: boolean;

    refetch: () => void;
}

export type RestfulRenderChildType<R> = React.ComponentType<RestfulRenderChildProps<R>>;

// RestfulRender's props, don't care about <R>
// Pick one of render or children (based on your interests) for Presenter component
export interface RestfulRenderProps<R> {
    // For user who don't wants use default Fetcher, others: don't use it
    fetcher?: Fetcher;

    // tslint:disable-next-line:no-any
    resource: Resource<any, R>;

    parameters?: RequestParams;

    // Presenter component
    render?: RestfulRenderChildType<R>;

    // Like `render` prop but in children style
    children?: (renderProps: RestfulRenderChildProps<R>) => React.ReactNode;

    onFetchCompleted?: (data: R) => void;

    initData?: R | undefined;
    initFetch?: boolean;
}

export interface RestfulRenderState<R> extends RestfulRenderProps<R> {
    prevParams?: RequestParams;
    needsUpdate?: boolean;
    fetching: boolean;
    componentRenderProps: RestfulRenderChildProps<R>;
}

export class RestfulRender<T> extends React.Component<RestfulRenderProps<T>, RestfulRenderState<T>> {
    static defaultProps = {
        parameters: []
    };

    // tslint:disable-next-line:no-any
    Component?: RestfulRenderChildType<T>;

    static getDerivedStateFromProps<R>(
        nextProps: RestfulRenderProps<R>,
        prevState: RestfulRenderState<R>): RestfulRenderState<R> | null {

        const isResourceChanged = nextProps.resource !== prevState.resource;
        const isParamsChanged = JSON.stringify(nextProps.parameters) !== JSON.stringify(prevState.parameters);

        if (isResourceChanged || isParamsChanged) {
            return {
                ...nextProps,
                prevParams: prevState.parameters,
                componentRenderProps: {
                    ...prevState.componentRenderProps,
                    fetching: true
                },
                needsUpdate: true,
                fetching: true
            };
        }

        return null;
    }

    constructor(props: RestfulRenderProps<T>) {
        super(props);

        const { render, initData, initFetch } = props;

        this.Component = render;

        const needsFetch = initFetch || !initData;

        this.state = {
            ...props,
            fetcher: props.fetcher || global[fetcherSymbol],
            fetching: needsFetch,
            componentRenderProps: {
                data: initData || null,
                error: null,
                refetch: this.fetching,
                fetching: needsFetch
            }
        };

        if (needsFetch) {
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
        const { componentRenderProps } = this.state;
        const { children } = this.props;
        const { Component } = this;

        if (Component) {
            return <Component {...componentRenderProps} />;
        }

        if (children) {
            return children(componentRenderProps);
        }

        return null;
    }

    fetching = async () => {
        const { fetcher, resource, parameters, onFetchCompleted, componentRenderProps } = this.state;

        try {
            const data = await fetcher!.fetchResource(resource, parameters);

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
        } catch (error) {
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
    }
}