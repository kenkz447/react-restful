import * as React from 'react';
import { Record, ResourceType, storeSymbol, Store, SubscribeEvent } from '../utilities';

export interface RestfulDataContainerProps<T extends Record> {
    resourceType: ResourceType<T>;
    dataSource: Array<T>;
    shouldConcatSources?: boolean;
    shouldAppendNewRecord?: (newRecord: T, index: number) => boolean;
    sort?: (first: T, second: T) => number;
    children?: (data: Array<T>) => JSX.Element;
    onRecordRemove?: (record: T) => void;
}

interface RestfulDataContainerState<T extends Record> {
    needsUpdateSource?: boolean;
    dataSource: Array<T>;
}

export class RestfulDataContainer<T> extends React.PureComponent<
    RestfulDataContainerProps<T>,
    RestfulDataContainerState<T>> {

    private isUnmounting = false;
    private store: Store = global[storeSymbol];
    private unsubscribeStore!: () => void;

    static getDerivedStateFromProps(
        nextProps: RestfulDataContainerProps<{}>,
        currentState: RestfulDataContainerState<{}>
    ) {
        const { dataSource, shouldConcatSources } = nextProps;

        if (currentState.needsUpdateSource) {
            return {
                dataSource: currentState.dataSource,
                needsUpdateSource: false
            };
        }

        if (dataSource === currentState.dataSource) {
            return null;
        }

        if (shouldConcatSources) {
            let nextSource = [...currentState.dataSource, ...dataSource];
            return {
                dataSource: nextSource
            };
        }

        return {
            dataSource: dataSource
        };
    }

    constructor(props: RestfulDataContainerProps<T>) {
        super(props);
        const { dataSource } = props;
        this.state = {
            dataSource: dataSource
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
            dataSource: updatedStateRecords
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

        for (const record of eventRecords) {
            const isRecordExist = this.isRecordExist(record);
            if (isRecordExist) {
                nextDataSource = this.replaceRecord(nextDataSource, record);
                continue;
            }

            nextDataSource.push(record);
        }

        this.setState({
            needsUpdateSource: true,
            dataSource: nextDataSource
        });
    }

    private getEventRecords = (e: SubscribeEvent<T>) => {
        const { shouldAppendNewRecord } = this.props;

        if (!Array.isArray(e.value)) {
            if (shouldAppendNewRecord && !shouldAppendNewRecord(e.value, 0)) {
                return [];
            }

            return [e.value];
        }

        if (shouldAppendNewRecord) {
            return e.value.filter(shouldAppendNewRecord);
        }

        return e.value;
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
        const { dataSource } = this.state;

        const { sort } = this.props;
        if (sort) {
            return dataSource.sort(sort);
        }

        return [...dataSource];
    }
}