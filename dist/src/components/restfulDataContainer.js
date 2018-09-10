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
    if (!restfulDataContainerProps.dataPropsKey) {
        restfulDataContainerProps.dataPropsKey = 'data';
    }
    if (!restfulDataContainerProps.getMappingDataFromProps) {
        restfulDataContainerProps.getMappingDataFromProps =
            (props) => props[restfulDataContainerProps.dataPropsKey];
    }
    return (Component) => class RestfulDataContainerComponent extends React.PureComponent {
        constructor(props) {
            super(props);
            this.getComponentProps = () => {
                const componentProps = {};
                for (const propKey in this.props) {
                    if (this.props.hasOwnProperty(propKey)) {
                        const propsValues = this.props[propKey];
                        const isDataProp = propKey !== restfulDataContainerProps.dataPropsKey;
                        if (!isDataProp) {
                            componentProps[propKey] = propsValues;
                        }
                    }
                }
                return componentProps;
            };
            this.checkRecordExistInState = (record) => {
                const { resourceType } = restfulDataContainerProps;
                const checkingRecordKey = resourceType.getRecordKey(record);
                for (const stateRecord of this.state.data) {
                    const inStateRecordKey = resourceType.getRecordKey(stateRecord);
                    if (checkingRecordKey === inStateRecordKey) {
                        return true;
                    }
                }
                return false;
            };
            this.onDataMapping = (e) => {
                const { store, resourceType } = restfulDataContainerProps;
                const record = e.record;
                const isRecordExit = this.checkRecordExistInState(record);
                switch (e.type) {
                    case 'mapping':
                        const eventRecordKey = resourceType.getRecordKey(record);
                        const existingRecordIndex = this.state.data.findIndex(o => {
                            return eventRecordKey === resourceType.getRecordKey(o);
                        });
                        if (existingRecordIndex >= 0) {
                            const newStateData = [...this.state.data];
                            newStateData[existingRecordIndex] = record;
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
                            this.setState(Object.assign({}, this.state, { data: [...this.state.data, record] }));
                        }
                        break;
                    case 'remove':
                        if (isRecordExit) {
                            const deletedRecordKey = resourceType.getRecordKey(record);
                            const updatedStateRecords = this.state.data.filter(o => resourceType.getRecordKey(o) !== deletedRecordKey);
                            this.setState(Object.assign({}, this.state, { data: updatedStateRecords }));
                        }
                        break;
                    default:
                        break;
                }
            };
            const { store, resourceType, getMappingDataFromProps } = restfulDataContainerProps;
            this.subscribeId = store.subscribe([resourceType], this.onDataMapping);
            const data = getMappingDataFromProps(props);
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
        componentWillUnmount() {
            const { store } = restfulDataContainerProps;
            store.unSubscribe(this.subscribeId);
        }
        render() {
            const { mapToProps } = restfulDataContainerProps;
            const componentProps = this.getComponentProps();
            return (React.createElement(Component, Object.assign({}, componentProps, mapToProps(this.state.data, this.props))));
        }
    };
}
exports.restfulDataContainer = restfulDataContainer;
