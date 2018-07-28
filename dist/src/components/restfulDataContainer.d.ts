import * as React from 'react';
import { RecordType, ResourceType, Store } from '../utilities';
interface RestfulDataContainerProps {
    store: Store;
    resourceType: ResourceType;
}
export interface RestfulDataContainerComponentProps<DataModel> {
    data: Array<DataModel>;
}
interface PaginationState<DataModel> {
    data: Array<DataModel>;
}
export declare function restfulDataContainer<T>(restfulPaginationProps: RestfulDataContainerProps): (Component: React.ComponentType<RestfulDataContainerComponentProps<T>>) => {
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