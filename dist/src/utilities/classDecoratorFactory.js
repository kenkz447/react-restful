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
function classDecoratorFactory(wrapper) {
    return (Component) => {
        const ComponentWithWrapper = wrapper(Component);
        class Factory extends React.Component {
            constructor() {
                super(...arguments);
                this.render = () => React.createElement(ComponentWithWrapper, Object.assign({}, this.props));
            }
        }
        return Factory;
    };
}
exports.classDecoratorFactory = classDecoratorFactory;
