import * as React from 'react';
import { Store } from '../utilities';
import { ResourceType } from '../utilities/ResourceType';
import { RecordType } from '../utilities/RecordTable';

interface RestfulPaginationProps {
    store: Store;
    resourceType: ResourceType;
}

export interface PaginationProps<DataModel> {
    data: Array<DataModel>;
}

interface PaginationState<DataModel> {
    data: Array<DataModel>;
}

export function restfulPagination<T>(restfulPaginationProps: RestfulPaginationProps) {
    return (Component: React.ComponentType<PaginationProps<T>>) =>
        class RestfulPaginationComponent extends React.Component<
            PaginationProps<T>,
            PaginationState<T>> {

            constructor(props: PaginationProps<T>) {
                super(props);

                const { store, resourceType } = restfulPaginationProps;
                store.subscribe([resourceType], (e) => {
                    const isRecordExit = this.checkRecordExist(e.record);

                    switch (e.type) {
                        case 'mapping':
                            if (isRecordExit) {
                                const updatedStateRecords = this.updateStateRecords(e.record);
                                this.setState({
                                    pagination: {
                                        ...this.state.pagination,
                                        data: updatedStateRecords
                                    }
                                });
                            }
                            break;
                        case 'remove':
                            if (isRecordExit) {
                                const deletedRecordKey = resourceType.getRecordKey(e.record);

                                const updatedStateRecords = this.state.pagination.data.filter(o =>
                                    resourceType.getRecordKey(o) !== deletedRecordKey);

                                this.setState({
                                    pagination: {
                                        ...this.state.pagination,
                                        data: updatedStateRecords
                                    }
                                });
                            }
                            break;
                        default:
                            break;
                    }
                });
                this.state = {
                    data: props.data
                };
            }

            componentDidMount() {
                //
            }

            render() {                
                return (
                    <Component
                        data={this.state.data}
                    />
                );
            }

            checkRecordExist(record: RecordType) {
                const { resourceType } = restfulPaginationProps;

                const checkingRecordKey = resourceType.getRecordKey(record);
                for (const stateRecord of this.state.pagination.data) {
                    const inStateRecordKey = resourceType.getRecordKey(stateRecord);
                    if (checkingRecordKey === inStateRecordKey) {
                        return true;
                    }
                }

                return false;
            }

            updateStateRecords(record: T | RecordType) {
                const { pagination } = this.state;
                const { resourceType } = restfulPaginationProps;
                const mappingRecordKey = resourceType.getRecordKey(record);

                return pagination.data.map(o => {
                    if (mappingRecordKey === resourceType.getRecordKey(o)) {
                        return record as T;
                    }
                    return o;
                });
            }
        };
}