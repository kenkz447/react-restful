import * as React from 'react';
import { ResourceType } from '../core';
export interface RestfulCollectionProps<T> {
    resourceType: ResourceType<T>;
    initDataSource: Array<T>;
    shouldAppendNewRecord?: boolean | ((newRecord: T, index: number) => boolean);
    sort?: (first: T, second: T) => number;
    filter?: (record: T, index: number, dataSource: T[]) => boolean;
    children: (data: Array<T>) => React.ReactNode;
    onRecordRemove?: (record: T) => void;
    onNewRecordsMapping?: (records: T[]) => void;
    enablePaginationMode?: boolean;
}
interface RestfulCollectionState<T> {
    needsUpdateSource?: boolean;
    dataSource: Array<T>;
    initDataSource: Array<T>;
}
export declare class RestfulCollection<T> extends React.PureComponent<RestfulCollectionProps<T>, RestfulCollectionState<T>> {
    static defaultProps: {
        shouldAppendNewRecord: boolean;
    };
    private isUnmounting;
    private store;
    private unsubscribeStore;
    static getDerivedStateFromProps(nextProps: RestfulCollectionProps<{}>, currentState: RestfulCollectionState<{}>): {
        dataSource: {}[];
        needsUpdateSource: boolean;
        initDataSource?: undefined;
    } | {
        dataSource: {}[];
        initDataSource: {}[];
        needsUpdateSource?: undefined;
    } | null;
    constructor(props: RestfulCollectionProps<T>);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onStoreEvent;
    private onDataRemove;
    private isRecordExist;
    private manualMapping;
    private getEventRecords;
    private shouldAppendRecord;
    private replaceRecord;
    render(): {} | null | undefined;
    private getRenderDataSource;
}
export {};