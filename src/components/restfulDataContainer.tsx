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

export function restfulDataContainer<DataMode extends RecordType, ComponentOwnProps, ComponentMappingProps>
    (restfulDataContainerProps: RestfulDataContainerProps<DataMode, ComponentOwnProps, ComponentMappingProps>) {

    if (!restfulDataContainerProps.dataPropsKey) {
        restfulDataContainerProps.dataPropsKey = 'data';
    }

    if (!restfulDataContainerProps.getMappingDataFromProps) {
        restfulDataContainerProps.getMappingDataFromProps =
            (props: ComponentOwnProps) => props[restfulDataContainerProps.dataPropsKey!];
    }

    return (Component: React.ComponentType<ComponentOwnProps>) =>
        class RestfulDataContainerComponent extends
            React.PureComponent<ComponentOwnProps, PaginationState<DataMode>> {

            mappingTimeout!: NodeJS.Timer;
            subscribeId: string;

            componentWillUnmount() {
                const { store } = restfulDataContainerProps;
                store.unSubscribe(this.subscribeId);
            }

            constructor(props: ComponentOwnProps) {
                super(props);

                const { store, resourceType, getMappingDataFromProps } = restfulDataContainerProps;

                this.subscribeId = store.subscribe([resourceType], this.onDataMapping);

                const data = getMappingDataFromProps!(props);
                const propDataIdMap = data && data.map(o => resourceType.getRecordKey(o));

                const mappingData = data ?
                    resourceType.getAllRecords(store, (recordInstance) => {
                        const recordInstanceKey = resourceType.getRecordKey(recordInstance);
                        return propDataIdMap.includes(recordInstanceKey);
                    }) :
                    resourceType.getAllRecords(store);

                this.state = {
                    data: mappingData
                };
            }

            render() {
                const { mapToProps } = restfulDataContainerProps;
                const componentProps = this.getComponentProps();

                return (
                    <Component
                        {...componentProps}
                        {...mapToProps(this.state.data, this.props)}
                    />
                );
            }

            getComponentProps = () => {
                const componentProps = {};
                for (const propKey in this.props) {
                    if (this.props.hasOwnProperty(propKey)) {
                        const propsValues = this.props[propKey];
                        const isDataProp = propKey !== restfulDataContainerProps.dataPropsKey;
                        if (!isDataProp) {
                            componentProps[propKey] = propsValues;
                        }
                    }
                }
                return componentProps;
            }

            checkRecordExistInState = (record: DataMode) => {
                const { resourceType } = restfulDataContainerProps;
                const checkingRecordKey = resourceType.getRecordKey(record);
                for (const stateRecord of this.state.data) {
                    const inStateRecordKey = resourceType.getRecordKey(stateRecord);
                    if (checkingRecordKey === inStateRecordKey) {
                        return true;
                    }
                }

                return false;
            }

            onDataMapping = (e: SubscribeEvent<DataMode>) => {
                const { store, resourceType } = restfulDataContainerProps;
                const record = e.record;
                const isRecordExit = this.checkRecordExistInState(record);

                switch (e.type) {
                    case 'mapping':
                        const eventRecordKey = resourceType.getRecordKey(record);
                        const existingRecordIndex = this.state.data.findIndex(o => {
                            return eventRecordKey === resourceType.getRecordKey(o);
                        });

                        if (existingRecordIndex >= 0) {
                            const newStateData = [...this.state.data];
                            newStateData[existingRecordIndex] = record;

                            if (this.mappingTimeout) {
                                clearTimeout(this.mappingTimeout);
                            }

                            this.mappingTimeout = setTimeout(() => {
                                const dataIds = newStateData.map(o => resourceType.getRecordKey(o));
                                const data = resourceType.getAllRecords(store, (o) =>
                                    dataIds.includes(resourceType.getRecordKey(o)));
                                this.setState({
                                    ...this.state,
                                    data: data
                                });
                                // tslint:disable-next-line:align
                            }, 100);
                        } else {
                            this.setState({
                                ...this.state,
                                data: [...this.state.data, record]
                            });
                        }
                        break;
                    case 'remove':
                        if (isRecordExit) {
                            const deletedRecordKey = resourceType.getRecordKey(record);

                            const updatedStateRecords = this.state.data.filter(o =>
                                resourceType.getRecordKey(o) !== deletedRecordKey);

                            this.setState({
                                ...this.state,
                                data: updatedStateRecords
                            });
                        }
                        break;
                    default:
                        break;
                }
            }
        };
}