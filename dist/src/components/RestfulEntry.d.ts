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
export declare class RestfulEntry<T extends RecordType> extends React.Component<RestfulEntryProps<T>, RestfulEntryState<T>> {
    constructor(props: RestfulEntryProps<T>);
    render(): JSX.Element;
    private syncWithStore;
}
export {};
