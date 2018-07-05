import * as React from 'react';
import { RecordType, ResourceType, Store } from '../utilities';

interface RestfulEntryRenderProps<T extends RecordType> {
    record: T | null;
    recordKey: string | number;
}

interface RestfulEntryProps<T extends RecordType> {
    store: Store;
    resourceType: ResourceType<T>;
    render: React.ComponentType<RestfulEntryRenderProps<T>>;
    recordkey: string | number;
}

interface RestfulEntryState<T extends RecordType> {
    record: T | null;
}

export class RestfulEntry<T extends RecordType> extends React.Component<
    RestfulEntryProps<T>,
    RestfulEntryState<T>> {
    constructor(props: RestfulEntryProps<T>) {
        super(props);
        const { store, recordkey, resourceType } = this.props;
        this.state = {
            record: store.findRecordByKey(resourceType, recordkey)
        };
    }

    render() {
        const Component = this.props.render;
        return this.props.render({
            recordKey: this.props.recordkey,
            record: this.state.record
        })
    }
}