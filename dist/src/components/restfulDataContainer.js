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
function restfulDataContainer(restfulDataContainerProps) {
    return (Component) => class RestfulDataContainerComponent extends React.PureComponent {
        componentWillUnmount() {
            const { store } = restfulDataContainerProps;
            store.unSubscribe(this.subscribeId);
        }
        constructor(props) {
            super(props);
            this.onDataMapping = this.onDataMapping.bind(this);
            const { data } = props;
            const { store, resourceType } = restfulDataContainerProps;
            this.subscribeId = store.subscribe([resourceType], this.onDataMapping);
            const propDataIdMap = data && data.map(o => resourceType.getRecordKey(o));
            const mappingData = data ?
                resourceType.getAllRecords(store, (recordInstance) => {
                    const recordInstanceKey = resourceType.getRecordKey(recordInstance);
                    return propDataIdMap.includes(recordInstanceKey);
                }) :
                resourceType.getAllRecords(store);
            this.state = {
                data: mappingData
            };
        }
        render() {
            const { mapToProps } = restfulDataContainerProps;
            return (React.createElement(Component, Object.assign({}, this.props, mapToProps(this.state.data, this.props))));
        }
        checkRecordExistInState(record) {
            const { resourceType } = restfulDataContainerProps;
            const checkingRecordKey = resourceType.getRecordKey(record);
            for (const stateRecord of this.state.data) {
                const inStateRecordKey = resourceType.getRecordKey(stateRecord);
                if (checkingRecordKey === inStateRecordKey) {
                    return true;
                }
            }
            return false;
        }
        onDataMapping(e) {
            const { store, resourceType } = restfulDataContainerProps;
            const isRecordExit = this.checkRecordExistInState(e.record);
            switch (e.type) {
                case 'mapping':
                    const eventRecordKey = resourceType.getRecordKey(e.record);
                    const existingRecordIndex = this.state.data.findIndex(o => {
                        return eventRecordKey === resourceType.getRecordKey(o);
                    });
                    if (existingRecordIndex >= 0) {
                        const newStateData = [...this.state.data];
                        newStateData[existingRecordIndex] = e.record;
                        if (this.mappingTimeout) {
                            clearTimeout(this.mappingTimeout);
                        }
                        this.mappingTimeout = setTimeout(() => {
                            const dataIds = newStateData.map(o => resourceType.getRecordKey(o));
                            const data = resourceType.getAllRecords(store, (o) => dataIds.includes(resourceType.getRecordKey(o)));
                            this.setState(Object.assign({}, this.state, { data: data }));
                            // tslint:disable-next-line:align
                        }, 100);
                    }
                    else {
                        this.setState(Object.assign({}, this.state, { data: [...this.state.data, e.record] }));
                    }
                    break;
                case 'remove':
                    if (isRecordExit) {
                        const deletedRecordKey = resourceType.getRecordKey(e.record);
                        const updatedStateRecords = this.state.data.filter(o => resourceType.getRecordKey(o) !== deletedRecordKey);
                        this.setState(Object.assign({}, this.state, { data: updatedStateRecords }));
                    }
                    break;
                default:
                    break;
            }
        }
    };
}
exports.restfulDataContainer = restfulDataContainer;
