/// <reference types="node" />
import * as React from 'react';
import { RecordType, ResourceType, Store, SubscribeEvent } from '../utilities';
interface RestfulDataContainerProps<T extends RecordType, P = {}> {
    store: Store;
    resourceType: ResourceType;
    mapToProps: (data: T[], ownProps: {}) => P;
}
export interface RestfulDataContainerComponentProps<T extends RecordType> {
    data: Array<T>;
}
interface PaginationState<T extends RecordType = RecordType> {
    data: Array<T | any>;
}
export declare function restfulDataContainer<T extends RecordType, P>(restfulDataContainerProps: RestfulDataContainerProps<T, P>): (Component: React.ComponentType<P>) => {
    new (props: RestfulDataContainerComponentProps<T>): {
        mappingTimeout: NodeJS.Timer;
        subscribeId: string;
        componentWillUnmount(): void;
        render(): JSX.Element;
        checkRecordExistInState(record: RecordType): boolean;
        onDataMapping(e: SubscribeEvent<RecordType>): void;
        setState<K extends "data">(state: PaginationState<T> | ((prevState: Readonly<PaginationState<T>>, props: RestfulDataContainerComponentProps<T>) => PaginationState<T> | Pick<PaginationState<T>, K> | null) | Pick<PaginationState<T>, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<RestfulDataContainerComponentProps<T>>;
        state: Readonly<PaginationState<T>>;
        context: any;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
};
export {};
