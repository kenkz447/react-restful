import * as React from 'react';
import { Resource, RequestParams, Record } from '../core';
interface RestfulMutateChildProps<DataModel, Meta> {
    sendRequest: (params?: RequestParams, meta?: Meta) => Promise<DataModel | false>;
    sending: boolean;
}
export interface RestfulMutateProps<DataModel, Meta = {}> {
    resource: Resource<DataModel>;
    defaultRequestParams?: RequestParams;
    defaultRequestMeta?: Meta;
    needsConfirm?: boolean;
    confirmDescription?: string;
    confirmMessage?: string;
    children: React.ComponentType<RestfulMutateChildProps<DataModel, Meta>>;
}
interface RestfulMutateState<DataModel extends Record, Meta> {
    sending: boolean;
}
export declare class RestfulMutate<DataModel extends Record, Meta> extends React.PureComponent<RestfulMutateProps<DataModel, Meta>, RestfulMutateState<DataModel, Meta>> {
    constructor(props: RestfulMutateProps<DataModel, Meta>);
    render(): JSX.Element;
    sendRequest: (params?: import("../core").RequestParameter | import("../core").RequestParameter[] | undefined, meta?: Meta | undefined) => Promise<false | DataModel>;
}
export {};
