import * as React from 'react';
import { Resource, Fetcher, RequestParams } from '../utilities';
export interface RestfulRenderChildProps<DataModel> {
    data: DataModel | null;
    error: Error | null;
    fetching?: boolean;
}
export declare type RestfulRenderChildType<DataModel> = React.ComponentType<RestfulRenderChildProps<DataModel>>;
export interface RestfulRenderProps<DataModel> {
    fetcher?: Fetcher;
    resource: Resource<DataModel>;
    parameters?: RequestParams;
    render?: RestfulRenderChildType<DataModel>;
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
export declare class RestfulRender<T> extends React.Component<RestfulRenderProps<T>, RestfulRenderState<T>> {
    static defaultProps: Partial<RestfulRenderProps<{}>>;
    Component: RestfulRenderChildType<T>;
    static getDerivedStateFromProps<DataModel>(nextProps: RestfulRenderProps<DataModel>, prevState: RestfulRenderState<DataModel>): RestfulRenderState<DataModel> | null;
    constructor(props: RestfulRenderProps<T>);
    componentDidMount(): void;
    componentDidUpdate(): void;
    render(): JSX.Element | null;
    fetching(): Promise<void>;
}
