import * as React from 'react';
import { ResourceType, Store } from '../utilities';

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
                    if (e.type === 'mapping') {
                        //
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
        };
}