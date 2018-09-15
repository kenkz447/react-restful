/// <reference types="node" />
import * as React from 'react';
import { RecordType, ResourceType, Store, SubscribeEvent } from '../utilities';
interface ContainerProps<DataModel extends RecordType, MappingProps, OwnProps> {
    readonly store: Store;
    readonly resourceType: ResourceType<DataModel>;
    readonly dataPropsKey?: string;
    readonly registerToTracking?: (props: OwnProps, current?: ReadonlyArray<DataModel>, event?: SubscribeEvent) => DataModel[];
    readonly mapToProps: (data: DataModel[], ownProps: OwnProps) => MappingProps;
}
export declare function restfulDataContainer<DataModel extends RecordType, MappingProps, OwnProps extends MappingProps>(containerProps: ContainerProps<DataModel, MappingProps, OwnProps>): (Component: new (arg: OwnProps) => React.Component<OwnProps, {}, any>) => {
    new (props: OwnProps): {
        readonly state: {
            readonly trackingData: DataModel[];
        };
        readonly subscribeId: string;
        mappingTimeout: NodeJS.Timer;
        componentWillUnmount(): void;
        render(): JSX.Element;
        checkRecordExistInState: (record: DataModel) => boolean;
        onStoreChange: (e: SubscribeEvent<DataModel>) => void;
        manualMapping: (e: SubscribeEvent<DataModel>) => undefined;
        autoMapping: (e: SubscribeEvent<DataModel>) => void;
        onDataRemove: (record: DataModel) => void;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<OwnProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        readonly props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<OwnProps>;
        context: any;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
};
export {};
