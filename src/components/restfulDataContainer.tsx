import * as React from 'react';
import { RecordType, ResourceType, Store, SubscribeEvent } from '../utilities';

interface RestfulDataContainerProps<T extends RecordType, P = {}> {
    store: Store;
    resourceType: ResourceType;
    mapToProps: (data: T[], ownProps: {}) => P;
}

export interface RestfulDataContainerComponentProps<T extends RecordType> {
    data: Array<T>;
}

interface PaginationState<T extends RecordType = RecordType> {
    // tslint:disable-next-line:no-any
    data: Array<T | any>;
}

export function restfulDataContainer<T extends RecordType, P>
    (restfulDataContainerProps: RestfulDataContainerProps<T, P>) {
    return (Component: React.ComponentType<P>) =>
        class RestfulDataContainerComponent extends React.PureComponent<
            RestfulDataContainerComponentProps<T>,
            PaginationState<T>> {

            mappingTimeout!: NodeJS.Timer;
            subscribeId: string;

            componentWillUnmount() {
                const { store } = restfulDataContainerProps;
                store.unSubscribe(this.subscribeId);
            }

            constructor(props: RestfulDataContainerComponentProps<T>) {
                super(props);

                this.onDataMapping = this.onDataMapping.bind(this);

                const { data } = props;
                const { store, resourceType } = restfulDataContainerProps;
                this.subscribeId = store.subscribe([resourceType], this.onDataMapping);

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

                return (
                    <Component {...this.props} {...mapToProps(this.state.data, this.props)} />
                );
            }

            checkRecordExistInState(record: RecordType) {
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

            onDataMapping(e: SubscribeEvent) {
                const { store, resourceType } = restfulDataContainerProps;
                const isRecordExit = this.checkRecordExistInState(e.record);

                switch (e.type) {
                    case 'mapping':
                        const eventRecordKey = resourceType.getRecordKey(e.record);
                        const existingRecordIndex = this.state.data.findIndex(o => {
                            return eventRecordKey === resourceType.getRecordKey(o);
                        });

                        if (existingRecordIndex >= 0) {
                            const newStateData = [...this.state.data];
                            newStateData[existingRecordIndex] = e.record;

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
                                data: [...this.state.data, e.record]
                            });
                        }
                        break;
                    case 'remove':
                        if (isRecordExit) {
                            const deletedRecordKey = resourceType.getRecordKey(e.record);

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