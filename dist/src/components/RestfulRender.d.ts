import React from 'react';
import { Resource, ResourceParameter, Store } from '../utilities';
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
export declare class RestfulRender<T> extends React.PureComponent<RestfulRenderProps<T>, RestfulRenderState<T>> {
    static getDerivedStateFromProps<DataModel>(nextProps: RestfulRenderProps<DataModel>, prevState: RestfulRenderState<DataModel>): RestfulRenderState<DataModel> | null;
    constructor(props: RestfulRenderProps<T>);
    componentDidMount(): void;
    render(): JSX.Element;
}
