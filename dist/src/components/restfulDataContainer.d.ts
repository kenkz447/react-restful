import * as React from 'react';
import { RecordType, ResourceType, Store } from '../utilities';
interface RestfulDataContainerProps<T extends RecordType, P = {}> {
    store: Store;
    resourceType: ResourceType;
    mapToProps: (data: T[]) => P;
}
export interface RestfulDataContainerComponentProps<T extends RecordType> {
    data: Array<T>;
}
interface PaginationState<T extends RecordType = RecordType> {
    data: Array<T | any>;
}
export declare function restfulDataContainer<T extends RecordType, P>(restfulDataContainerProps: RestfulDataContainerProps<T, P>): (Component: React.ComponentType<P>) => {
    new (props: RestfulDataContainerComponentProps<T>): {
        componentDidMount(): void;
        render(): JSX.Element;
        checkRecordExist(record: RecordType): boolean;
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
