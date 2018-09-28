/// <reference types="node" />
import * as React from 'react';
import { RecordType, ResourceType, Store, SubscribeEvent } from '../utilities';
declare type shouldTrackingNewRecordFunc<DataModel, OwnProps> = (record: DataModel, ownProps: OwnProps, trackedData: ReadonlyArray<DataModel>) => boolean;
interface ContainerProps<DataModel extends RecordType, MappingProps, OwnProps> {
    readonly store?: Store;
    readonly resourceType: ResourceType<DataModel>;
    readonly shouldTrackingNewRecord?: shouldTrackingNewRecordFunc<DataModel, OwnProps> | boolean;
    readonly registerToTracking?: (props: OwnProps, current?: ReadonlyArray<DataModel>, event?: SubscribeEvent) => ReadonlyArray<DataModel>;
    readonly mapToProps: (data: ReadonlyArray<DataModel>, ownProps: OwnProps) => MappingProps;
}
interface RestfulDataContainerState<DataModel> {
    readonly trackingData: ReadonlyArray<DataModel>;
}
export declare function restfulDataContainer<DataModel extends RecordType, MappingProps, OwnProps extends MappingProps>(containerProps: ContainerProps<DataModel, MappingProps, OwnProps>): (Component: React.ComponentType<OwnProps>) => {
    new (props: OwnProps, context: {}): {
        readonly store: Store;
        readonly subscribeId: string;
        mappingTimeout: NodeJS.Timer;
        componentWillUnmount(): void;
        render(): JSX.Element;
        isTracked: (record: DataModel) => boolean;
        onStoreEvent: (e: SubscribeEvent<DataModel>) => void;
        manualMapping: (e: SubscribeEvent<DataModel>) => undefined;
        autoMapping: (e: SubscribeEvent<DataModel>) => void;
        onDataRemove: (record: DataModel) => void;
        setState<K extends "trackingData">(state: RestfulDataContainerState<DataModel> | ((prevState: Readonly<RestfulDataContainerState<DataModel>>, props: Readonly<OwnProps>) => RestfulDataContainerState<DataModel> | Pick<RestfulDataContainerState<DataModel>, K> | null) | Pick<RestfulDataContainerState<DataModel>, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        readonly props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<OwnProps>;
        state: Readonly<RestfulDataContainerState<DataModel>>;
        context: any;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
};
export {};
