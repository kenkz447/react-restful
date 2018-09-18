import * as React from 'react';
import { RecordType, ResourceType, Store, SubscribeEvent } from '../utilities';

interface ContainerProps<DataModel extends RecordType, MappingProps, OwnProps> {
    readonly store: Store;
    readonly resourceType: ResourceType<DataModel>;
    readonly dataPropsKey?: string;
    readonly registerToTracking?: (
        props: OwnProps,
        current?: ReadonlyArray<DataModel>,
        event?: SubscribeEvent
    ) => ReadonlyArray<DataModel>;
    readonly mapToProps: (data: ReadonlyArray<DataModel>, ownProps: OwnProps) => MappingProps;
}

interface RestfulDataContainerState<DataModel> {
    readonly trackingData: ReadonlyArray<DataModel>;
}

export function restfulDataContainer
    <DataModel extends RecordType, MappingProps, OwnProps extends MappingProps>
    (containerProps: ContainerProps<DataModel, MappingProps, OwnProps>) {
    return (Component: React.ComponentType<OwnProps>) =>
        class RestfulDataContainer extends React.Component<OwnProps, RestfulDataContainerState<DataModel>> {
            readonly subscribeId: string;
            mappingTimeout!: NodeJS.Timer;

            componentWillUnmount() {
                const { store } = containerProps;
                store.unSubscribe(this.subscribeId);
            }

            constructor(props: OwnProps, context: {}) {
                super(props, context);

                const {
                    store,
                    resourceType,
                    registerToTracking
                } = containerProps;

                this.subscribeId = store.subscribe([resourceType], this.onStoreEvent);

                const data = registerToTracking && registerToTracking(props);
                const propDataIdMap = data && data.map(o => resourceType.getRecordKey(o));

                const mappingData = propDataIdMap ?
                    resourceType.getAllRecords(store, (recordInstance) => {
                        const recordInstanceKey = resourceType.getRecordKey(recordInstance);
                        return propDataIdMap.includes(recordInstanceKey);
                    }) :
                    resourceType.getAllRecords(store);

                this.state = {
                    trackingData: mappingData
                };
            }

            render() {
                const { mapToProps } = containerProps;
                const mapedProps = mapToProps(this.state.trackingData, this.props);

                const props = Object.assign({}, this.props, mapedProps);

                return (
                    <Component {...props} />
                );
            }

            isTracked = (record: DataModel) => {
                const { resourceType } = containerProps;
                const checkingRecordKey = resourceType.getRecordKey(record);
                for (const stateRecord of this.state.trackingData) {
                    const inStateRecordKey = resourceType.getRecordKey(stateRecord);
                    if (checkingRecordKey === inStateRecordKey) {
                        return true;
                    }
                }

                return false;
            }

            onStoreEvent = (e: SubscribeEvent<DataModel>) => {
                if (e.type === 'remove') {
                    return this.onDataRemove(e.record);
                }

                const { registerToTracking } = containerProps;

                if (registerToTracking) {
                    return this.manualMapping(e);
                }

                return this.autoMapping(e);
            }

            manualMapping = (e: SubscribeEvent<DataModel>) => {
                const { resourceType, registerToTracking } = containerProps;
                const eventRecordKey = resourceType.getRecordKey(e.record);

                if (!registerToTracking) {
                    return void this.autoMapping(e);
                }

                const nextTrackingData = this.state.trackingData.map(o => {
                    if (resourceType.getRecordKey(o) === eventRecordKey) {
                        return e.record;
                    }
                    return o;
                });

                const data = registerToTracking(this.props, nextTrackingData, e);

                const hasAddToTracking = data.find(o =>
                    resourceType.getRecordKey(o) === eventRecordKey
                );

                if (!hasAddToTracking) {
                    return;
                }

                if (this.mappingTimeout) {
                    clearTimeout(this.mappingTimeout);
                }

                this.mappingTimeout = setTimeout(
                    () => this.setState({
                        ...this.state,
                        trackingData: data
                    }),
                    100
                );
            }

            autoMapping = (e: SubscribeEvent<DataModel>) => {
                const { store, resourceType } = containerProps;

                const eventRecordKey = resourceType.getRecordKey(e.record);

                const existingRecordIndex = this.state.trackingData.findIndex(o => {
                    return eventRecordKey === resourceType.getRecordKey(o);
                });

                if (existingRecordIndex < 0) {
                    return this.setState({
                        ...this.state,
                        trackingData: [...this.state.trackingData, e.record]
                    });
                }

                const newStateData = [...this.state.trackingData];
                newStateData[existingRecordIndex] = e.record;

                if (this.mappingTimeout) {
                    clearTimeout(this.mappingTimeout);
                }

                this.mappingTimeout = setTimeout(
                    () => {
                        const dataIds = newStateData.map(newStateRecord => resourceType.getRecordKey(newStateRecord));

                        const data = resourceType.getAllRecords(store, (record) =>
                            dataIds.includes(resourceType.getRecordKey(record)));

                        this.setState({
                            ...this.state,
                            trackingData: data
                        });
                    },
                    100
                );
            }

            onDataRemove = (record: DataModel) => {
                const { resourceType } = containerProps;

                const isRecordExit = this.isTracked(record);

                if (!isRecordExit) {
                    return;
                }

                const deletedRecordKey = resourceType.getRecordKey(record);

                const updatedStateRecords = this.state.trackingData.filter(o =>
                    resourceType.getRecordKey(o) !== deletedRecordKey);

                this.setState({
                    ...this.state,
                    trackingData: updatedStateRecords
                });
            }
        };
}