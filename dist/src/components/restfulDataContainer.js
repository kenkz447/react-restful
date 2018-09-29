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
/**
 * @deprecated, use withRestfulData instead
 * !Will be removed at version 2.0
 */
function restfulDataContainer(containerProps) {
    return (Component) => class RestfulDataContainer extends React.PureComponent {
        constructor(props, context) {
            super(props, context);
            this.isTracked = (record) => {
                const { resourceType } = containerProps;
                const checkingRecordKey = resourceType.getRecordKey(record);
                for (const stateRecord of this.state.trackingData) {
                    const inStateRecordKey = resourceType.getRecordKey(stateRecord);
                    if (checkingRecordKey === inStateRecordKey) {
                        return true;
                    }
                }
                return false;
            };
            this.onStoreEvent = (e) => {
                if (e.type === 'remove') {
                    return this.onDataRemove(e.record);
                }
                const { registerToTracking } = containerProps;
                if (registerToTracking) {
                    return this.manualMapping(e);
                }
                return this.autoMapping(e);
            };
            this.manualMapping = (e) => {
                const { resourceType, registerToTracking, sort } = containerProps;
                const eventRecordKey = resourceType.getRecordKey(e.record);
                if (!registerToTracking) {
                    return void this.autoMapping(e);
                }
                if (!this.tempData) {
                    this.tempData = [...this.state.trackingData];
                }
                const nextTrackingData = this.tempData.map(o => {
                    if (resourceType.getRecordKey(o) === eventRecordKey) {
                        return e.record;
                    }
                    return o;
                });
                const recordExistedInTrackingList = nextTrackingData.find(o => resourceType.getRecordKey(o) === eventRecordKey);
                const allowTrackingNewRecord = (!recordExistedInTrackingList && this.shouldTrackingNewRecord)
                    && (typeof this.shouldTrackingNewRecord === 'boolean' ?
                        this.shouldTrackingNewRecord :
                        this.shouldTrackingNewRecord(e.record, this.props, this.state.trackingData));
                let data = allowTrackingNewRecord ?
                    registerToTracking(this.props, [...nextTrackingData, e.record], e) :
                    registerToTracking(this.props, nextTrackingData, e);
                if (sort) {
                    data = data.sort(sort);
                }
                const hasAddToTracking = data.find(o => resourceType.getRecordKey(o) === eventRecordKey);
                if (!hasAddToTracking) {
                    this.tempData = null;
                    return;
                }
                this.deferererSetState(data);
                this.tempData = data;
            };
            this.deferererSetState = (data) => {
                if (this.mappingTimeout) {
                    clearTimeout(this.mappingTimeout);
                }
                const snapshotTrackingData = this.state.trackingData;
                this.mappingTimeout = setTimeout(() => {
                    this.setState((stateNow) => {
                        if (stateNow.trackingData !== snapshotTrackingData) {
                            return null;
                        }
                        return {
                            trackingData: data
                        };
                    });
                    this.tempData = null;
                }, 100);
            };
            this.autoMapping = (e) => {
                const { resourceType } = containerProps;
                const eventRecordKey = resourceType.getRecordKey(e.record);
                const existingRecordIndex = this.state.trackingData.findIndex(o => {
                    return eventRecordKey === resourceType.getRecordKey(o);
                });
                if (existingRecordIndex < 0) {
                    return this.setState(Object.assign({}, this.state, { trackingData: [...this.state.trackingData, e.record] }));
                }
                const newStateData = [...this.state.trackingData];
                newStateData[existingRecordIndex] = e.record;
                if (this.mappingTimeout) {
                    clearTimeout(this.mappingTimeout);
                }
                this.mappingTimeout = setTimeout(() => {
                    const dataIds = newStateData.map(newStateRecord => resourceType.getRecordKey(newStateRecord));
                    const data = resourceType.getAllRecords(this.store, (record) => dataIds.includes(resourceType.getRecordKey(record)));
                    this.setState(Object.assign({}, this.state, { trackingData: data }));
                }, 100);
            };
            this.onDataRemove = (record) => {
                const { resourceType } = containerProps;
                const isRecordExit = this.isTracked(record);
                if (!isRecordExit) {
                    return;
                }
                const deletedRecordKey = resourceType.getRecordKey(record);
                const updatedStateRecords = this.state.trackingData.filter(o => resourceType.getRecordKey(o) !== deletedRecordKey);
                this.setState(Object.assign({}, this.state, { trackingData: updatedStateRecords }));
            };
            const { store, resourceType, registerToTracking, shouldTrackingNewRecord } = containerProps;
            this.store = store || global[utilities_1.storeSymbol];
            this.shouldTrackingNewRecord = shouldTrackingNewRecord || true;
            this.unsubscribeStore = this.store.subscribe([resourceType], this.onStoreEvent);
            const data = registerToTracking && registerToTracking(props);
            const propDataIdMap = data && data.map(o => resourceType.getRecordKey(o));
            const mappingData = propDataIdMap ?
                resourceType.getAllRecords(this.store, (recordInstance) => {
                    const recordInstanceKey = resourceType.getRecordKey(recordInstance);
                    return propDataIdMap.includes(recordInstanceKey);
                }) :
                resourceType.getAllRecords(this.store);
            this.state = {
                props: props,
                trackingData: mappingData
            };
        }
        static getDerivedStateFromProps(nextProps, state) {
            const { registerToTracking, sort } = containerProps;
            for (const nextPropKey in nextProps) {
                if (!nextProps.hasOwnProperty(nextPropKey)) {
                    continue;
                }
                if (state.props[nextPropKey] !== nextProps[nextPropKey]) {
                    let newTrackingData = registerToTracking && registerToTracking(nextProps, []);
                    if (newTrackingData && sort) {
                        newTrackingData = newTrackingData.sort(sort);
                    }
                    return Object.assign({}, state, { props: nextProps, trackingData: newTrackingData });
                }
            }
            return null;
        }
        componentWillUnmount() {
            this.unsubscribeStore();
        }
        render() {
            const { mapToProps } = containerProps;
            const { trackingData } = this.state;
            const mapedProps = mapToProps(trackingData, this.props);
            const props = Object.assign({}, this.props, mapedProps);
            return (React.createElement(Component, Object.assign({}, props)));
        }
    };
}
exports.restfulDataContainer = restfulDataContainer;
exports.withRestfulData = restfulDataContainer;
