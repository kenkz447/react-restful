import * as React from 'react';
import { Resource, Fetcher, RequestParams } from '../utilities';
export interface RestfulRenderChildProps<R> {
    data: R | null;
    error: Error | null;
    fetching: boolean;
    refetch: () => void;
}
export declare type RestfulRenderChildType<R> = React.ComponentType<RestfulRenderChildProps<R>>;
export interface RestfulRenderProps<R> {
    fetcher?: Fetcher;
    resource: Resource<any, R>;
    parameters?: RequestParams;
    render?: RestfulRenderChildType<R>;
    children?: (renderProps: RestfulRenderChildProps<R>) => React.ReactNode;
    onFetchCompleted?: (data: R) => void;
    initData?: R | undefined;
}
export interface RestfulRenderState<R> extends RestfulRenderProps<R> {
    prevParams?: RequestParams;
    needsUpdate?: boolean;
    fetching: boolean;
    componentRenderProps: RestfulRenderChildProps<R>;
}
export declare class RestfulRender<T> extends React.Component<RestfulRenderProps<T>, RestfulRenderState<T>> {
    static defaultProps: {
        parameters: never[];
    };
    Component?: RestfulRenderChildType<T>;
    static getDerivedStateFromProps<R>(nextProps: RestfulRenderProps<R>, prevState: RestfulRenderState<R>): RestfulRenderState<R> | null;
    constructor(props: RestfulRenderProps<T>);
    componentDidUpdate(): void;
    render(): {} | null | undefined;
    fetching: () => Promise<void>;
}
