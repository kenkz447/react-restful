/// <reference types="node" />
import * as React from 'react';
import { RecordType, ResourceType, Store, SubscribeEvent } from '../utilities';
interface RestfulDataContainerProps<DataModel extends RecordType, ComponentProps, MappingProps> {
    store: Store;
    resourceType: ResourceType<DataModel>;
    dataPropsKey?: string;
    getMappingDataFromProps?: (props: ComponentProps) => DataModel[];
    mapToProps: (data: DataModel[], ownProps: ComponentProps) => MappingProps;
}
interface PaginationState<T extends RecordType> {
    data: Array<T>;
}
export declare function restfulDataContainer<DataMode extends RecordType, ComponentOwnProps, ComponentMappingProps>(restfulDataContainerProps: RestfulDataContainerProps<DataMode, ComponentOwnProps, ComponentMappingProps>): (Component: React.ComponentType<ComponentOwnProps>) => {
    new (props: ComponentOwnProps): {
        mappingTimeout: NodeJS.Timer;
        subscribeId: string;
        componentWillUnmount(): void;
        render(): JSX.Element;
        getComponentProps: () => {};
        checkRecordExistInState: (record: DataMode) => boolean;
        onDataMapping: (e: SubscribeEvent<DataMode>) => void;
        setState<K extends "data">(state: PaginationState<DataMode> | ((prevState: Readonly<PaginationState<DataMode>>, props: ComponentOwnProps) => PaginationState<DataMode> | Pick<PaginationState<DataMode>, K> | null) | Pick<PaginationState<DataMode>, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<ComponentOwnProps>;
        state: Readonly<PaginationState<DataMode>>;
        context: any;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
};
export {};
