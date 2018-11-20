import * as React from 'react';
import { Record, ResourceType } from '../utilities';
export interface RestfulDataContainerProps<T extends Record> {
    resourceType: ResourceType<T>;
    dataSource: Array<T>;
    shouldConcatSources?: boolean;
    shouldAppendNewRecord?: (newRecord: T, index: number) => boolean;
    sort?: (first: T, second: T) => number;
    children: (data: Array<T>) => JSX.Element;
    onRecordRemove?: (record: T) => void;
}
interface RestfulDataContainerState<T extends Record> {
    needsUpdateSource?: boolean;
    dataSource: Array<T>;
}
export declare class RestfulDataContainer<T> extends React.PureComponent<RestfulDataContainerProps<T>, RestfulDataContainerState<T>> {
    private isUnmounting;
    private store;
    private unsubscribeStore;
    static getDerivedStateFromProps(nextProps: RestfulDataContainerProps<{}>, currentState: RestfulDataContainerState<{}>): {
        dataSource: {}[];
        needsUpdateSource: boolean;
    } | {
        dataSource: {}[];
        needsUpdateSource?: undefined;
    } | null;
    constructor(props: RestfulDataContainerProps<T>);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onStoreEvent;
    private onDataRemove;
    private isRecordExist;
    private manualMapping;
    private getEventRecords;
    private replaceRecord;
    render(): JSX.Element | null;
    private getRenderDataSource;
}
export {};
