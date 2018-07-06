import * as React from 'react';
import { RecordType, ResourceType, Store } from '../utilities';

export interface RestfulEntryRenderProps<T extends RecordType> {
    record: T | null;
    recordKey: string | number;
    status: 'synced' | 'outdate' | 'deleted';
    syncWithStore: () => void;
}

export interface RestfulEntryProps<T extends RecordType> {
    store: Store;
    resourceType: ResourceType<T>;
    render: React.ComponentType<RestfulEntryRenderProps<T>>;
    recordKey: RestfulEntryRenderProps<T>['recordKey'];
    autoSyncWithStore?: boolean;
}

interface RestfulEntryState<T extends RecordType> {
    recordKey: RestfulEntryRenderProps<T>['recordKey'];
    record: RestfulEntryRenderProps<T>['record'];
    status: RestfulEntryRenderProps<T>['status'];
}

export class RestfulEntry<T extends RecordType> extends React.Component<
    RestfulEntryProps<T>,
    RestfulEntryState<T>> {

    constructor(props: RestfulEntryProps<T>) {
        super(props);
        const { store, recordKey, resourceType } = this.props;

        store.subscribe([resourceType], (e) => {
            if (resourceType.getRecordKey(e.record as T) === recordKey) {
                switch (e.type) {
                    case 'mapping':
                        if (this.props.autoSyncWithStore) {
                            this.setState({ record: e.record as T });
                        } else {
                            this.setState({ status: 'outdate' });
                        }
                        break;
                    case 'remove':
                        this.setState({ status: 'deleted' });
                        break;
                    default:
                        break;
                }
            }
        });

        this.state = {
            recordKey: recordKey,
            record: store.findRecordByKey(resourceType, recordKey),
            status: 'synced'
        };

        this.syncWithStore = this.syncWithStore.bind(this);
    }

    render() {
        const Component = this.props.render;
        return (
            <Component
                recordKey={this.state.recordKey}
                record={this.state.record}
                status={this.state.status}
                syncWithStore={this.syncWithStore}
            />
        );
    }

    private syncWithStore() {
        const { store, recordKey, resourceType } = this.props;
        this.setState({
            record: store.findRecordByKey(resourceType, recordKey),
            status: 'synced'
        });
    }
}