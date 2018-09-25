import * as React from 'react';

export class PropsSetter<T> extends React.PureComponent {
    state: {
        props: T | null
    };

    constructor(props: Object) {
        super(props);
        this.state = {
            props: null
        };
        this.setProps = this.setProps.bind(this);
    }

    setProps(props: T) {
        this.setState({props});
    }

    render() {
        const child = React.Children.only(this.props.children);

        if (this.state.props) {
            return React.cloneElement(child, this.state.props);
        }

        return child;
    }
}