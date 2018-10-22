import * as React from 'react';
import { Record, ResourceType, Store, SubscribeEvent, storeSymbol } from '../utilities';

type shouldTrackingNewRecordFunc<DataModel, OwnProps> = (
    record: DataModel,
    ownProps: Readonly<OwnProps>,
    trackedData: Array<DataModel>
) => boolean;

interface ContainerProps<DataModel extends Record, MappingProps, OwnProps extends MappingProps = MappingProps> {
    readonly store?: Store;

    readonly resourceType: ResourceType<DataModel>;

    readonly shouldTrackingNewRecord?: shouldTrackingNewRecordFunc<DataModel, OwnProps> | boolean;

    readonly registerToTracking?: (
        props: Readonly<OwnProps>,
        current?: Array<DataModel>,
        event?: SubscribeEvent
    ) => Array<DataModel>;

    readonly sort?: (a: DataModel, b: DataModel) => number;

    readonly mapToProps: (data: Array<DataModel>, ownProps: Readonly<OwnProps>) => MappingProps;
}

interface RestfulDataContainerState<DataModel, OwnProps> {
    readonly props: OwnProps;
    readonly trackingData: Array<DataModel>;
}

/**
 * @deprecated, use withRestfulData instead
 */
export function restfulDataContainer
    <DataModel extends Record, MappingProps, OwnProps extends MappingProps = MappingProps>
    (containerProps: ContainerProps<DataModel, MappingProps, OwnProps>) {
    return (Component: React.ComponentType<OwnProps>) =>
        class RestfulDataContainer extends React.PureComponent<
            OwnProps,
            RestfulDataContainerState<DataModel, OwnProps>
            > {

            readonly shouldTrackingNewRecord: shouldTrackingNewRecordFunc<DataModel, OwnProps> | boolean;

            readonly store: Store;

            readonly unsubscribeStore: () => void;

            mappingTimeout!: NodeJS.Timer;
            tempData!: DataModel[] | null;

            static getDerivedStateFromProps(
                nextProps: OwnProps,
                state: RestfulDataContainerState<DataModel, OwnProps>
            ) {
                const { registerToTracking, sort } = containerProps;

                if (!registerToTracking) {
                    return null;
                }

                const collectionKey = Object.keys(nextProps)[0];

                if (state.props[collectionKey] !== nextProps[collectionKey]) {

                    let newTrackingData = registerToTracking && registerToTracking(nextProps, []);
                        
                    if (newTrackingData && sort) {
                        newTrackingData = newTrackingData.sort(sort);
                    }

                    return {
                        ...state,
                        props: nextProps,
                        trackingData: newTrackingData
                    };
                }

                return null;
            }

            componentWillUnmount() {
                this.unsubscribeStore();
            }

            constructor(props: OwnProps, context: {}) {
                super(props, context);

                const {
                    store,
                    resourceType,
                    registerToTracking,
                    shouldTrackingNewRecord
                } = containerProps;

                this.store = store || global[storeSymbol];
                this.shouldTrackingNewRecord = shouldTrackingNewRecord || true;

                this.unsubscribeStore = this.store.subscribe([resourceType], this.onStoreEvent);

                const data = registerToTracking && registerToTracking(props);
                const propDataIdMap = data && data.map(o => resourceType.getRecordKey(o));

                const mappingData = propDataIdMap ?
                    resourceType.getAllRecords(this.store, (recordInstance) => {
                        const recordInstanceKey = resourceType.getRecordKey(recordInstance);
                        return propDataIdMap.includes(recordInstanceKey);
                    }) :
                    resourceType.getAllRecords(this.store);

                this.state = {
                    props: props,
                    trackingData: mappingData
                };
            }

            render() {
                const { mapToProps } = containerProps;
                const { trackingData } = this.state;

                const mapedProps = mapToProps(trackingData, this.props);

                const props = Object.assign({}, this.props, mapedProps);

                return (<Component {...props} />);
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
                const { resourceType, registerToTracking, sort } = containerProps;
                const eventRecordKey = resourceType.getRecordKey(e.record);

                if (!registerToTracking) {
                    return void this.autoMapping(e);
                }

                if (!this.tempData) {
                    this.tempData = [...this.state.trackingData];
                }

                const nextTrackingData = this.tempData.map(o => {
                    if (resourceType.getRecordKey(o) === eventRecordKey) {
                        return e.record;
                    }
                    return o;
                });

                const recordExistedInTrackingList =
                    nextTrackingData.find(o => resourceType.getRecordKey(o) === eventRecordKey);

                const allowTrackingNewRecord = (!recordExistedInTrackingList && this.shouldTrackingNewRecord)
                    && (
                        typeof this.shouldTrackingNewRecord === 'boolean' ?
                            this.shouldTrackingNewRecord :
                            this.shouldTrackingNewRecord(e.record, this.props, this.state.trackingData)
                    );

                let data = allowTrackingNewRecord ?
                    registerToTracking(this.props, [...nextTrackingData, e.record], e) :
                    registerToTracking(this.props, nextTrackingData, e);

                if (sort) {
                    data = data.sort(sort);
                }

                const hasAddToTracking = data.find(o =>
                    resourceType.getRecordKey(o) === eventRecordKey
                );

                if (!hasAddToTracking) {
                    this.tempData = null;
                    return;
                }

                this.deferererSetState(data);
                this.tempData = data;
            }

            deferererSetState = (data: Array<DataModel>) => {
                if (this.mappingTimeout) {
                    clearTimeout(this.mappingTimeout);
                }

                const snapshotTrackingData = this.state.trackingData;

                this.mappingTimeout = setTimeout(
                    () => {
                        this.setState((stateNow) => {
                            if (stateNow.trackingData !== snapshotTrackingData) {
                                return null;
                            }

                            return {
                                trackingData: data
                            };
                        });
                        this.tempData = null;
                    },
                    100
                );
            }

            autoMapping = (e: SubscribeEvent<DataModel>) => {
                const { resourceType } = containerProps;

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

                        const data = resourceType.getAllRecords(this.store, (record) =>
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

export const withRestfulData = restfulDataContainer;