import * as React from 'react';
export declare class PropsSetter<T> extends React.PureComponent {
    state: {
        props: T | null;
    };
    constructor(props: Object);
    setProps(props: T): void;
    render(): React.ReactElement<any>;
}
