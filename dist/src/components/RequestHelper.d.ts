import * as React from 'react';
import { Resource, RequestParams, Record } from '../utilities';
interface RequestHelperChildProps<DataModel, Meta> {
    sendRequest: (params?: RequestParams, meta?: Meta) => Promise<DataModel | false>;
    sending: boolean;
}
export interface RequestHelperProps<DataModel, Meta = {}> {
    resource: Resource<DataModel>;
    defaultRequestParams?: RequestParams;
    defaultRequestMeta?: Meta;
    needsConfirm?: boolean;
    confirmDescription?: string;
    confirmMessage?: string;
    children: React.ComponentType<RequestHelperChildProps<DataModel, Meta>>;
}
interface RequestHelperState<DataModel extends Record, Meta> {
    sending: boolean;
}
export declare class RequestHelper<DataModel extends Record, Meta> extends React.PureComponent<RequestHelperProps<DataModel, Meta>, RequestHelperState<DataModel, Meta>> {
    constructor(props: RequestHelperProps<DataModel, Meta>);
    render(): JSX.Element;
    sendRequest: (params?: import("../utilities/Fetcher").RequestParameter | import("../utilities/Fetcher").RequestParameter[] | undefined, meta?: Meta | undefined) => Promise<false | DataModel>;
}
export {};
