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
function restfulDataContainer(containerProps) {
    return (Component) => class RestfulDataContainer extends React.Component {
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
                const { resourceType, registerToTracking } = containerProps;
                const eventRecordKey = resourceType.getRecordKey(e.record);
                if (!registerToTracking) {
                    return void this.autoMapping(e);
                }
                const nextTrackingData = this.state.trackingData.map(o => {
                    if (resourceType.getRecordKey(o) === eventRecordKey) {
                        return e.record;
                    }
                    return o;
                });
                const data = registerToTracking(this.props, nextTrackingData, e);
                const hasAddToTracking = data.find(o => resourceType.getRecordKey(o) === eventRecordKey);
                if (!hasAddToTracking) {
                    return;
                }
                if (this.mappingTimeout) {
                    clearTimeout(this.mappingTimeout);
                }
                this.mappingTimeout = setTimeout(() => this.setState(Object.assign({}, this.state, { data: data })), 100);
            };
            this.autoMapping = (e) => {
                const { store, resourceType } = containerProps;
                const eventRecordKey = resourceType.getRecordKey(e.record);
                const existingRecordIndex = this.state.trackingData.findIndex(o => {
                    return eventRecordKey === resourceType.getRecordKey(o);
                });
                if (existingRecordIndex < 0) {
                    return this.setState(Object.assign({}, this.state, { data: [...this.state.trackingData, e.record] }));
                }
                const newStateData = [...this.state.trackingData];
                newStateData[existingRecordIndex] = e.record;
                if (this.mappingTimeout) {
                    clearTimeout(this.mappingTimeout);
                }
                this.mappingTimeout = setTimeout(() => {
                    const dataIds = newStateData.map(newStateRecord => resourceType.getRecordKey(newStateRecord));
                    const data = resourceType.getAllRecords(store, (record) => dataIds.includes(resourceType.getRecordKey(record)));
                    this.setState(Object.assign({}, this.state, { data: data }));
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
                this.setState(Object.assign({}, this.state, { data: updatedStateRecords }));
            };
            const { store, resourceType, registerToTracking } = containerProps;
            this.subscribeId = store.subscribe([resourceType], this.onStoreEvent);
            const data = registerToTracking && registerToTracking(props);
            const propDataIdMap = data && data.map(o => resourceType.getRecordKey(o));
            const mappingData = propDataIdMap ?
                resourceType.getAllRecords(store, (recordInstance) => {
                    const recordInstanceKey = resourceType.getRecordKey(recordInstance);
                    return propDataIdMap.includes(recordInstanceKey);
                }) :
                resourceType.getAllRecords(store);
            this.state = {
                trackingData: mappingData
            };
        }
        componentWillUnmount() {
            const { store } = containerProps;
            store.unSubscribe(this.subscribeId);
        }
        render() {
            const { mapToProps } = containerProps;
            const mapedProps = mapToProps(this.state.trackingData, this.props);
            const props = Object.assign({}, this.props, mapedProps);
            return (React.createElement(Component, Object.assign({}, props)));
        }
    };
}
exports.restfulDataContainer = restfulDataContainer;
