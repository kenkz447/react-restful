import * as React from 'react';
declare type Wrapper<P> = (Component: React.ComponentClass<P>) => new (props: P, context: {}) => React.Component<P>;
export declare function classDecoratorFactory<P>(wrapper: Wrapper<P>): <C extends React.ComponentClass<P, any>>(Component: C) => C;
export {};
