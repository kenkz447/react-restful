import * as React from 'react';
import { Store } from '../utilities';
import { ResourceType } from '../utilities/ResourceType';

interface RestfulPaginationProps {
    store: Store;
    resourceType: ResourceType;
}

export interface PaginationProps<DataModel> {
    data: Array<DataModel>;
    totalItems: number;
    currentPage: number;
    pageSize: number;
}

interface PaginationState<DataModel> {
    pagination: PaginationProps<DataModel>;
}

export function restfulPagination<T>(restfulPaginationProps: RestfulPaginationProps) {
    return (Component: React.ComponentType<PaginationProps<T>>) =>
        class RestfulPaginationComponent extends React.Component<
            PaginationProps<T>, PaginationState<T>> {

            constructor(props: PaginationProps<T>) {
                super(props);

                const { store, resourceType } = restfulPaginationProps;
                store.subscribe([resourceType], (e) => {
                    if (e.type === 'mapping') {
                        //
                    }
                });

                this.state = {
                    pagination: props
                };
            }

            componentDidMount() {
                //
            }

            render() {
                return (
                    <Component
                        data={this.state.pagination.data}
                        pageSize={this.state.pagination.pageSize}
                        currentPage={this.state.pagination.currentPage}
                        totalItems={this.state.pagination.totalItems}
                    />
                );
            }
        };
}