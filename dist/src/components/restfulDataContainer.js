"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
function restfulDataContainer(restfulPaginationProps) {
    return function (Component) {
        return /** @class */ (function (_super) {
            __extends(RestfulDataContainerComponent, _super);
            function RestfulDataContainerComponent(props) {
                var _this = _super.call(this, props) || this;
                var store = restfulPaginationProps.store, resourceType = restfulPaginationProps.resourceType;
                store.subscribe([resourceType], function (e) {
                    var isRecordExit = _this.checkRecordExist(e.record);
                    switch (e.type) {
                        case 'remove':
                            if (isRecordExit) {
                                var deletedRecordKey_1 = resourceType.getRecordKey(e.record);
                                var updatedStateRecords = _this.state.data.filter(function (o) {
                                    return resourceType.getRecordKey(o) !== deletedRecordKey_1;
                                });
                                _this.setState(__assign({}, _this.state, { data: updatedStateRecords }));
                            }
                            break;
                        default:
                            break;
                    }
                });
                _this.state = {
                    data: props.data
                };
                return _this;
            }
            RestfulDataContainerComponent.prototype.componentDidMount = function () {
                //
            };
            RestfulDataContainerComponent.prototype.render = function () {
                return (React.createElement(Component, { data: this.state.data }));
            };
            RestfulDataContainerComponent.prototype.checkRecordExist = function (record) {
                var e_1, _a;
                var resourceType = restfulPaginationProps.resourceType;
                var checkingRecordKey = resourceType.getRecordKey(record);
                try {
                    for (var _b = __values(this.state.data), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var stateRecord = _c.value;
                        var inStateRecordKey = resourceType.getRecordKey(stateRecord);
                        if (checkingRecordKey === inStateRecordKey) {
                            return true;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return false;
            };
            return RestfulDataContainerComponent;
        }(React.Component));
    };
}
exports.restfulDataContainer = restfulDataContainer;
