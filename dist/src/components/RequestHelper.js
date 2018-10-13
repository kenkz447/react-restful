"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
class RequestHelper extends React.PureComponent {
    constructor(props) {
        super(props);
        this.sendRequest = (params, meta) => __awaiter(this, void 0, void 0, function* () {
            if (this.state.sending) {
                return false;
            }
            const { resource, defaultRequestParams, defaultRequestMeta, needsConfirm, confirmMessage, confirmDescription } = this.props;
            const globalFetcher = global[utilities_1.fetcherSymbol];
            const { fetchResource, onRequestConfirm } = globalFetcher;
            const requestParams = params || defaultRequestParams;
            const requestMeta = meta || defaultRequestMeta;
            if (needsConfirm || confirmMessage || confirmDescription) {
                const confirmed = yield onRequestConfirm({
                    message: confirmMessage,
                    description: confirmDescription,
                    resource: resource,
                    params: requestParams,
                    meta: requestMeta
                });
                if (!confirmed) {
                    return false;
                }
            }
            this.setState({
                sending: true
            });
            try {
                const data = yield fetchResource(resource, requestParams, requestMeta);
                return data;
            }
            catch (error) {
                throw error;
            }
            finally {
                this.setState({
                    sending: false
                });
            }
        });
        this.state = {
            sending: false
        };
    }
    render() {
        const { children } = this.props;
        const { sending } = this.state;
        const ChildComponent = children;
        return (React.createElement(ChildComponent, { sendRequest: this.sendRequest, sending: sending }));
    }
}
exports.RequestHelper = RequestHelper;
