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
    ) => DataModel[];
    readonly mapToProps: (data: DataModel[], ownProps: OwnProps) => MappingProps;
}

export function restfulDataContainer
    <DataModel extends RecordType, MappingProps, OwnProps extends MappingProps>
    (containerProps: ContainerProps<DataModel, MappingProps, OwnProps>) {
    return (Component: new (arg: OwnProps) => React.Component<OwnProps>) =>
        class RestfulDataContainer extends Component {
            readonly state: {
                readonly trackingData: Array<DataModel>;
            };

            readonly subscribeId: string;
            mappingTimeout!: NodeJS.Timer;

            componentWillUnmount() {
                const { store } = containerProps;
                store.unSubscribe(this.subscribeId);
            }

            constructor(props: OwnProps) {
                super(props);

                const {
                    store,
                    resourceType,
                    registerToTracking
                } = containerProps;

                this.subscribeId = store.subscribe([resourceType], this.onStoreChange);

                const data = registerToTracking!(props);
                const propDataIdMap = data && data.map(o => resourceType.getRecordKey(o));

                const mappingData = data ?
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
                    <Component {...props as OwnProps} />
                );
            }

            checkRecordExistInState = (record: DataModel) => {
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

            onStoreChange = (e: SubscribeEvent<DataModel>) => {
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

                const data = registerToTracking(this.props, this.state.trackingData, e);
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
                    () => this.setState({ ...this.state, data: data }),
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
                        data: [...this.state.trackingData, e.record]
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
                            data: data
                        });
                    },
                    100
                );
            }

            onDataRemove = (record: DataModel) => {
                const { resourceType } = containerProps;

                const isRecordExit = this.checkRecordExistInState(record);

                if (!isRecordExit) {
                    return;
                }

                const deletedRecordKey = resourceType.getRecordKey(record);

                const updatedStateRecords = this.state.trackingData.filter(o =>
                    resourceType.getRecordKey(o) !== deletedRecordKey);

                this.setState({
                    ...this.state,
                    data: updatedStateRecords
                });
            }
        };
}