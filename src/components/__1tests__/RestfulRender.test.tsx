import { mockResponse } from 'jest-fetch-mock';
import * as React from 'react';
import * as TestUtils from 'react-dom/test-utils';
import {
    createEnvironment,
    Environment,
    Resource,
    ResourceParameter,
    ResourceProps
    } from '../../utilities';
import { Store } from '../../utilities/Store';
import { RestfulComponentRenderProps, RestfulRender, RestfulRenderProps } from '../RestfulRender';
const ReactTestRenderer = require('react-test-renderer');


class PropsSetter extends React.PureComponent {
    state: {
        props: RestfulRenderProps | null
    };

    constructor(props: Object) {
        super(props);
        this.state = {
            props: null,
        };
        this.setProps = this.setProps.bind(this);
    }

    setProps(props: RestfulRenderProps) {
        this.setState(props);
    }

    render() {
        const child = React.Children.only(this.props.children);
        if (this.state.props) {
            const element = React.cloneElement(child, this.state.props);
            return element;
        }
        return child;
    }
}

describe('RestfulRender', () => {
    const mockResponseData = [{ id: '12345' }, { id: '12346' }];
    mockResponse(JSON.stringify(mockResponseData));

    let render: jest.Mock<JSX.Element>;
    let testEnvironment: Environment;

    let testResource = new Resource({
        resourceType: 'user',
        url: '/api/getUsersByBranch/{branchId}',
        method: 'GET',
    });

    let testParameter: Array<ResourceParameter> = [{
        type: 'path',
        parameter: 'branchId',
        value: 1
    }, {
        type: 'query',
        parameter: 'page',
        value: 1
    }, {
        type: 'query',
        parameter: 'size',
        value: 20
    }];

    beforeEach(() => {
        jest.resetModules();
        expect.extend({
            toBeRendered: (readyState) => {
                const calls = render.mock.calls;
                expect(calls.length).toBe(1);
                expect(calls[0][0]).toEqual(readyState);
                return {
                    pass: true,
                    message: () => ''
                };
            }
        });
        render = jest.fn(() => <div />);
        testEnvironment = createEnvironment({
            store: new Store(),
            fetch: jest.fn((url: string, requestInit: RequestInit) => {
                return fetch(url, requestInit);
            })
        });
    });

    describe('initialized', () => {
        beforeEach(() => {
            TestUtils.renderIntoDocument(
                <RestfulRender
                    environment={testEnvironment}
                    resource={testResource}
                    parameters={testParameter}
                    render={render}
                />
            );
        });
        it('init fetch with given props', () => {
            // expect(testEnvironment.fetch).toBeCalled();
            console.log('toBeRendered');

            expect({
                data: null,
                error: null
            }).toBeRendered();
        });
    });

    describe('Render when props changed', () => {
        let rendererInstance: PropsSetter;
        beforeEach(() => {
            rendererInstance = ReactTestRenderer.create(
                <PropsSetter>
                    <RestfulRender
                        environment={testEnvironment}
                        resource={testResource}
                        parameters={testParameter}
                        render={render}
                    />
                </PropsSetter>
            ) as PropsSetter;
        });

        // it('rerender when resource changed', () => {
        //     testResource = new Resource({
        //         resourceType: 'userNext',
        //         url: '/api/getUsersByBranch/{branchId}',
        //         method: 'GET',
        //     });

        //     rendererInstance.getInstance().setProps({
        //         environment: testEnvironment,
        //         resource: testResource,
        //         parameters: testParameter,
        //         render: render
        //     });

        //     // expect(testEnvironment.fetch).toBeCalled();
        //     console.log('toBeRendered');
        //     expect({}).toBeRendered();
        // });

        // it('rerender when parameters changed', () => {
        //     testParameter = [...testParameter];
        //     rendererInstance.setProps({
        //         resource: testResource,
        //         parameters: testParameter,
        //         render: (props) => {
        //             const { data } = props;
        //             return JSON.stringify(data);
        //         }
        //     });
        //     expect(elementNode.textContent).toEqual(`rerender when parameters changed; ${mockResponseData}`);
        // });

        // it('rerender when render changed', () => {
        //     rendererInstance.setProps({
        //         resource: testResource,
        //         parameters: testParameter,
        //         render: () => {
        //             return 'rerender when render changed';
        //         }
        //     });
        //     expect(elementNode.textContent).toEqual('rerender when render changed');
        // });
    });

});
