import React from 'react';
import { Resource, ResourceParameter, Store, Fetcher } from '../utilities';
export interface RestfulComponentRenderProps<DataModel> {
    data?: DataModel | null;
    error?: Error | null;
    fetching?: boolean;
}
export interface RestfulRenderProps<DataModel> {
    store: Store;
    resource: Resource<DataModel>;
    parameters: Array<ResourceParameter>;
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
export declare class RestfulRender<T> extends React.PureComponent<RestfulRenderProps<T>, RestfulRenderState<T>> {
    static getDerivedStateFromProps<DataModel>(nextProps: RestfulRenderProps<DataModel>, prevState: RestfulRenderState<DataModel>): RestfulRenderState<DataModel> | null;
    constructor(props: RestfulRenderProps<T>);
    componentDidMount(): void;
    componentDidUpdate(prevProps: RestfulRenderProps<T>, prevState: RestfulRenderState<T>): void;
    render(): JSX.Element;
    fetching(): void;
}
