import * as React from 'react';
import { ResourceType, storeSymbol, Store, SubscribeEvent } from '../utilities';

export interface RestfulDataContainerProps<T> {
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

interface RestfulDataContainerState<T> {
    needsUpdateSource?: boolean;
    dataSource: Array<T>;
    initDataSource: Array<T>;
}

export class RestfulDataContainer<T> extends React.PureComponent<
    RestfulDataContainerProps<T>,
    RestfulDataContainerState<T>> {
    static defaultProps = {
        shouldAppendNewRecord: true
    };

    private isUnmounting = false;
    private store: Store = global[storeSymbol];
    private unsubscribeStore!: () => void;

    static getDerivedStateFromProps(
        nextProps: RestfulDataContainerProps<{}>,
        currentState: RestfulDataContainerState<{}>
    ) {
        if (currentState.needsUpdateSource) {
            return {
                dataSource: currentState.dataSource,
                needsUpdateSource: false
            };
        }

        const { enablePaginationMode, initDataSource } = nextProps;

        if (enablePaginationMode) {
            if (initDataSource !== currentState.initDataSource) {
                return {
                    dataSource: initDataSource,
                    initDataSource: initDataSource
                };
            }
        }
        
        return null;
    }

    constructor(props: RestfulDataContainerProps<T>) {
        super(props);
        const { initDataSource } = props;
        this.state = {
            dataSource: initDataSource,
            initDataSource: initDataSource
        };
    }

    componentDidMount() {
        const { resourceType } = this.props;
        this.unsubscribeStore = this.store.subscribe([resourceType], this.onStoreEvent);
    }

    componentWillUnmount() {
        this.isUnmounting = true;
        this.unsubscribeStore();
    }

    private onStoreEvent = (e: SubscribeEvent<T>) => {
        if (e.type === 'remove') {
            return this.onDataRemove(e.value as T);
        }

        return this.manualMapping(e);
    }

    private onDataRemove = (record: T) => {
        const { resourceType } = this.props;

        const isRecordExist = this.isRecordExist(record);

        if (!isRecordExist) {
            return;
        }

        const deletedRecordKey = resourceType.getRecordKey(record);

        const updatedStateRecords = this.state.dataSource.filter(o =>
            resourceType.getRecordKey(o) !== deletedRecordKey);

        this.setState({
            dataSource: updatedStateRecords,
            needsUpdateSource: true
        });
    }

    private isRecordExist = (record: T) => {
        const { resourceType } = this.props;

        const checkingRecordKey = resourceType.getRecordKey(record);
        for (const stateRecord of this.state.dataSource) {
            const inStateRecordKey = resourceType.getRecordKey(stateRecord);
            if (checkingRecordKey === inStateRecordKey) {
                return true;
            }
        }

        return false;
    }

    private manualMapping = (e: SubscribeEvent<T>) => {

        if (this.isUnmounting) {
            return;
        }

        const eventRecords = this.getEventRecords(e);
        if (!eventRecords.length) {
            return;
        }

        let nextDataSource = [...this.state.dataSource];
        let newRecords = [];

        for (const record of eventRecords) {
            const isRecordExist = this.isRecordExist(record);
            if (isRecordExist) {
                nextDataSource = this.replaceRecord(nextDataSource, record);
                continue;
            }

            newRecords.push(record);
        }

        nextDataSource = nextDataSource.concat(newRecords);

        const { onNewRecordsMapping } = this.props;
        if (onNewRecordsMapping && newRecords.length) {
            onNewRecordsMapping(newRecords);
        }

        this.setState({
            needsUpdateSource: true,
            dataSource: nextDataSource
        });
    }

    private getEventRecords = (e: SubscribeEvent<T>) => {
        const isSingleRecord = !Array.isArray(e.value);

        if (isSingleRecord) {
            const record = e.value as T;
            const isRecordExisting = this.isRecordExist(record);

            if (isRecordExisting) {
                return [record];
            }

            const isShouldAppendNewRecord = this.shouldAppendRecord(record);
            if (isShouldAppendNewRecord) {
                return [record];
            }

            return [];
        }

        const records = e.value as Array<T>;

        return records.filter((o, index) => {
            if (this.isRecordExist(o)) {
                return true;
            }

            return this.shouldAppendRecord(o, index);
        });
    }

    private shouldAppendRecord = (record: T, index?: number) => {
        const { shouldAppendNewRecord } = this.props;

        if (!shouldAppendNewRecord) {
            return false;
        }

        if (typeof shouldAppendNewRecord === 'boolean') {
            return shouldAppendNewRecord;
        }

        return shouldAppendNewRecord(record, index || 0);
    }

    private replaceRecord = (source: Array<T>, newRecord: T) => {
        const { resourceType } = this.props;
        const newRecordKey = resourceType.getRecordKey(newRecord);

        return source.map(existRecord => {
            if (resourceType.getRecordKey(existRecord) === newRecordKey) {
                return newRecord;
            }
            return existRecord;
        });
    }

    public render() {
        const { children } = this.props;
        if (!children) {
            return null;
        }

        const dataSource = this.getRenderDataSource();
        return children(dataSource);
    }

    private getRenderDataSource = () => {
        const { sort, filter } = this.props;
        const { dataSource } = this.state;

        let renderDataSource: Array<T> = [...dataSource];

        if (filter) {
            renderDataSource = renderDataSource.filter(filter, this);
        }

        if (sort) {
            renderDataSource = renderDataSource.sort(sort);
        }

        return renderDataSource;
    }
}