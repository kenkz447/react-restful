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
class PropsSetter extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            props: null
        };
        this.setProps = this.setProps.bind(this);
    }
    setProps(props) {
        this.setState({ props });
    }
    render() {
        const child = React.Children.only(this.props.children);
        if (this.state.props) {
            return React.cloneElement(child, this.state.props);
        }
        return child;
    }
}
exports.PropsSetter = PropsSetter;
