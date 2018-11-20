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
        };
        this.getEventRecords = (e) => {
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
            const { dataSource } = this.state;
            const { sort } = this.props;
            if (sort) {
                return dataSource.sort(sort);
            }
            return [...dataSource];
        };
        const { dataSource } = props;
        this.state = {
            dataSource: dataSource
        };
    }
    static getDerivedStateFromProps(nextProps, currentState) {
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
exports.RestfulDataContainer = RestfulDataContainer;
