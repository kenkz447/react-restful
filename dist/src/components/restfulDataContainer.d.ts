/// <reference types="node" />
import * as React from 'react';
import { RecordType, ResourceType, Store, SubscribeEvent } from '../utilities';
declare type shouldTrackingNewRecordFunc<DataModel, OwnProps> = (record: DataModel, ownProps: OwnProps, trackedData: Array<DataModel>) => boolean;
declare type ShouldTrackingNewRecord<DataModel, OwnProps> = shouldTrackingNewRecordFunc<DataModel, OwnProps> | boolean;
interface ContainerProps<DataModel extends RecordType, MappingProps, OwnProps = MappingProps> {
    readonly store?: Store;
    readonly resourceType: ResourceType<DataModel>;
    readonly shouldTrackingNewRecord?: ShouldTrackingNewRecord<DataModel, OwnProps>;
    readonly registerToTracking?: (props: OwnProps, current?: Array<DataModel>, event?: SubscribeEvent) => Array<DataModel>;
    readonly sort?: (a: DataModel, b: DataModel) => number;
    readonly mapToProps: (data: Array<DataModel>, ownProps: OwnProps) => MappingProps;
}
interface RestfulDataContainerState<DataModel> {
    readonly trackingData: Array<DataModel>;
}
/**
 * @deprecated, use withRestfulData instead
 * !Will be removed at version 2.0
 */
export declare function restfulDataContainer<DataModel extends RecordType, MappingProps, OwnProps extends MappingProps = MappingProps>(containerProps: ContainerProps<DataModel, MappingProps, OwnProps>): (Component: React.ComponentType<OwnProps>) => {
    new (props: OwnProps, context: {}): {
        readonly shouldTrackingNewRecord: ShouldTrackingNewRecord<DataModel, OwnProps>;
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
export declare const withRestfulData: typeof restfulDataContainer;
export {};
