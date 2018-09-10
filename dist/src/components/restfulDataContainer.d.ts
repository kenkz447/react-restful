/// <reference types="node" />
import * as React from 'react';
import { RecordType, ResourceType, Store, SubscribeEvent } from '../utilities';
interface RestfulDataContainerProps<DataModel extends RecordType, ComponentProps> {
    store: Store;
    resourceType: ResourceType<DataModel>;
    dataPropsKey?: string;
    getData?: (props: ComponentProps) => DataModel[];
    mapToProps: (data: DataModel[], ownProps: ComponentProps) => Partial<ComponentProps>;
}
interface PaginationState<T extends RecordType> {
    data: Array<T>;
}
export declare function restfulDataContainer<DataMode extends RecordType, ComponentProps>(restfulDataContainerProps: RestfulDataContainerProps<DataMode, ComponentProps>): (Component: React.ComponentType<ComponentProps>) => {
    new (props: ComponentProps): {
        mappingTimeout: NodeJS.Timer;
        subscribeId: string;
        componentWillUnmount(): void;
        render(): JSX.Element;
        getComponentProps: () => {};
        checkRecordExistInState: (record: DataMode) => boolean;
        onDataMapping: (e: SubscribeEvent<DataMode>) => void;
        setState<K extends "data">(state: PaginationState<DataMode> | ((prevState: Readonly<PaginationState<DataMode>>, props: ComponentProps) => PaginationState<DataMode> | Pick<PaginationState<DataMode>, K> | null) | Pick<PaginationState<DataMode>, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<ComponentProps>;
        state: Readonly<PaginationState<DataMode>>;
        context: any;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
};
export {};
