"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const utilities_1 = require("../utilities");
class RestfulDataContainer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.isUnmounting = false;
        this.store = global[utilities_1.storeSymbol];
        this.onStoreEvent = (e) => {
            if (e.type === 'remove') {
                return this.onDataRemove(e.value);
            }
            return this.manualMapping(e);
        };
        this.onDataRemove = (record) => {
            const { resourceType } = this.props;
            const isRecordExist = this.isRecordExist(record);
            if (!isRecordExist) {
                return;
            }
            const deletedRecordKey = resourceType.getRecordKey(record);
            const updatedStateRecords = this.state.dataSource.filter(o => resourceType.getRecordKey(o) !== deletedRecordKey);
            this.setState({
                dataSource: updatedStateRecords,
                needsUpdateSource: true
            });
        };
        this.isRecordExist = (record) => {
            const { resourceType } = this.props;
            const checkingRecordKey = resourceType.getRecordKey(record);
            for (const stateRecord of this.state.dataSource) {
                const inStateRecordKey = resourceType.getRecordKey(stateRecord);
                if (checkingRecordKey === inStateRecordKey) {
                    return true;
                }
            }
            return false;
        };
        this.manualMapping = (e) => {
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
        };
        this.getEventRecords = (e) => {
            const isSingleRecord = !Array.isArray(e.value);
            if (isSingleRecord) {
                const record = e.value;
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
            const records = e.value;
            return records.filter((o, index) => {
                if (this.isRecordExist(o)) {
                    return true;
                }
                return this.shouldAppendRecord(o, index);
            });
        };
        this.shouldAppendRecord = (record, index) => {
            const { shouldAppendNewRecord } = this.props;
            if (!shouldAppendNewRecord) {
                return false;
            }
            if (typeof shouldAppendNewRecord === 'boolean') {
                return shouldAppendNewRecord;
            }
            return shouldAppendNewRecord(record, index || 0);
        };
        this.replaceRecord = (source, newRecord) => {
            const { resourceType } = this.props;
            const newRecordKey = resourceType.getRecordKey(newRecord);
            return source.map(existRecord => {
                if (resourceType.getRecordKey(existRecord) === newRecordKey) {
                    return newRecord;
                }
                return existRecord;
            });
        };
        this.getRenderDataSource = () => {
            const { sort, filter } = this.props;
            const { dataSource } = this.state;
            let renderDataSource = [...dataSource];
            if (filter) {
                renderDataSource = renderDataSource.filter(filter, this);
            }
            if (sort) {
                renderDataSource = dataSource.sort(sort);
            }
            return renderDataSource;
        };
        const { initDataSource } = props;
        this.state = {
            dataSource: initDataSource,
            initDataSource: initDataSource
        };
    }
    static getDerivedStateFromProps(nextProps, currentState) {
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
    componentDidMount() {
        const { resourceType } = this.props;
        this.unsubscribeStore = this.store.subscribe([resourceType], this.onStoreEvent);
    }
    componentWillUnmount() {
        this.isUnmounting = true;
        this.unsubscribeStore();
    }
    render() {
        const { children } = this.props;
        if (!children) {
            return null;
        }
        const dataSource = this.getRenderDataSource();
        return children(dataSource);
    }
}
RestfulDataContainer.defaultProps = {
    shouldAppendNewRecord: true
};
exports.RestfulDataContainer = RestfulDataContainer;
