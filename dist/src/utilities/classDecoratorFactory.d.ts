import * as React from 'react';
declare type Wrapper<P> = (Component: React.ComponentClass<P>) => new (...arg: object[]) => React.Component<P>;
export declare function classDecoratorFactory<P>(wrapper: Wrapper<P>): <C extends React.ComponentClass<P, any>>(Component: C) => C;
export {};
