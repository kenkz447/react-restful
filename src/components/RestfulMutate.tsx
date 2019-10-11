import * as React from 'react';
import { Resource, RequestParams, fetcherSymbol, Fetcher, Record } from '../core';

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

export class RestfulMutate<DataModel extends Record, Meta> extends React.PureComponent<
    RestfulMutateProps<DataModel, Meta>,
    RestfulMutateState<DataModel, Meta>> {

    constructor(props: RestfulMutateProps<DataModel, Meta>) {
        super(props);

        this.state = {
            sending: false
        };
    }

    public render() {
        const { children } = this.props;
        const { sending } = this.state;
        const ChildComponent = children;

        return (
            <ChildComponent
                sendRequest={this.sendRequest}
                sending={sending}
            />
        );
    }

    sendRequest = async (params?: RequestParams, meta?: Meta) => {
        if (this.state.sending) {
            return false;
        }

        const {
            resource,
            defaultRequestParams,
            defaultRequestMeta,
            needsConfirm,
            confirmMessage,
            confirmDescription
        } = this.props;

        const globalFetcher = global[fetcherSymbol] as Fetcher;
        const { fetchResource, onRequestConfirm } = globalFetcher;

        const requestParams = params || defaultRequestParams;
        const requestMeta = meta || defaultRequestMeta;

        if (needsConfirm || confirmMessage || confirmDescription) {
            const confirmed = await onRequestConfirm({
                message: confirmMessage,
                description: confirmDescription,
                resource: resource,
                params: requestParams,
                meta: requestMeta
            });

            if (!confirmed) {
                return false;
            }
        }

        this.setState({
            sending: true
        });

        try {
            const data = await fetchResource(
                resource,
                requestParams,
                requestMeta
            );

            return data;
        } catch (error) {
            throw error;
        } finally {
            this.setState({
                sending: false
            });
        }
    }
}