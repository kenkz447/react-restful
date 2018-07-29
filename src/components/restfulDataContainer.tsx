import * as React from 'react';
import { RecordType, ResourceType, Store } from '../utilities';

interface RestfulDataContainerProps<T extends RecordType, P = {}> {
    store: Store;
    resourceType: ResourceType;
    mapToProps: (data: T[]) => P;
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

            constructor(props: RestfulDataContainerComponentProps<T>) {
                super(props);

                const { store, resourceType } = restfulDataContainerProps;
                store.subscribe([resourceType], (e) => {
                    const isRecordExit = this.checkRecordExist(e.record);

                    switch (e.type) {
                        case 'mapping':
                            if (this.props.data === undefined) {
                                const eventRecordKey = resourceType.getRecordKey(e.record);
                                const existingRecordIndex = this.state.data.findIndex(o => {
                                    return eventRecordKey === resourceType.getRecordKey(o);
                                });

                                if (existingRecordIndex >= 0) {
                                    const newStateData = [...this.state.data];
                                    newStateData[existingRecordIndex] = e.record;
                                    this.setState({
                                        ...this.state
                                    });
                                } else {
                                    this.setState({
                                        ...this.state,
                                        data: [...this.state.data, e.record]
                                    });
                                }
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
                });

                if (this.props.data) {
                    this.state = { data: props.data };
                } else {
                    this.state = {
                        data: resourceType.getAllRecords(store)
                    };
                }
            }

            componentDidMount() {
                //
            }

            render() {
                const { mapToProps } = restfulDataContainerProps;

                return (
                    <Component {...this.props} {...mapToProps(this.state.data)} />
                );
            }

            checkRecordExist(record: RecordType) {
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
        };
}