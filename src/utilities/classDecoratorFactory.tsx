import * as React from 'react';

type Wrapper<P> = (Component: React.ComponentClass<P>) => new (props: P, context: {}) => React.Component<P>;

export function classDecoratorFactory<P>(wrapper: Wrapper<P>) {
    return <C extends React.ComponentClass<P>>(Component: C): C => {

        const ComponentWithWrapper = wrapper(Component);

        class Factory extends React.Component<P> {
            readonly render = () => <ComponentWithWrapper {...this.props} />;
        }
        return Factory as C;
    };
}