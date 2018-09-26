import * as React from 'react';
import { Resource, ResourceParameter, Store, Fetcher } from '../utilities';
export interface RestfulComponentRenderProps<DataModel> {
    data?: DataModel | null;
    error?: Error | null;
    fetching?: boolean;
}
export interface RestfulRenderProps<DataModel> {
    store?: Store;
    fetcher?: Fetcher;
    resource: Resource<DataModel>;
    parameters?: Array<ResourceParameter>;
    /**
     * @deprecated, use children instead
     * !Will be removed at version 2.0
     */
    render?: React.ComponentType<RestfulComponentRenderProps<DataModel>>;
    children?: React.ComponentType<RestfulComponentRenderProps<DataModel>>;
    onFetchCompleted?: (data: DataModel) => void;
}
export interface RestfulRenderState<DataModel> extends RestfulRenderProps<DataModel> {
    needsUpdate?: boolean;
    fetching?: boolean;
    componentRenderProps: RestfulComponentRenderProps<DataModel>;
}
export declare class RestfulRender<T> extends React.Component<RestfulRenderProps<T>, RestfulRenderState<T>> {
    static defaultProps: Partial<RestfulRenderProps<{}>>;
    static getDerivedStateFromProps<DataModel>(nextProps: RestfulRenderProps<DataModel>, prevState: RestfulRenderState<DataModel>): RestfulRenderState<DataModel> | null;
    constructor(props: RestfulRenderProps<T>);
    componentDidMount(): void;
    componentDidUpdate(): void;
    render(): JSX.Element | null;
    fetching(): void;
}
