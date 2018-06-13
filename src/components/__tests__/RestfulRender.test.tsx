import { mockResponse } from 'jest-fetch-mock';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';
import {
    createEnvironment,
    Resource,
    ResourceParameters,
    ResourceProps
} from '../../utilities';
import { RestfulRender, RestfulRenderProps, RestfulComponentRenderProps } from '../RestfulRender';
import { Store } from '../../utilities/Store';

interface TestDataModel {

}

describe('RestfulRender', () => {
    let render: jest.Mock<JSX.Element>;
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
    });

    class PropsSetter extends React.PureComponent {
        state: {
            props: RestfulRenderProps<TestDataModel> | null
        };

        constructor(props: Object) {
            super(props);
            this.state = {
                props: null,
            };
            this.setProps = this.setProps.bind(this);
        }

        setProps(props: RestfulRenderProps<TestDataModel>) {
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

    const testEnvironment = createEnvironment({
        store: new Store(),
        fetch: jest.fn((url, requestInit) => {
            return fetch(url, requestInit as RequestInit);
        })
    });

    const mockResponseData = [{ id: '12345' }, { id: '12346' }];
    mockResponse(JSON.stringify(mockResponseData));

    const testResourceProps: ResourceProps = {
        url: '/api/getUsersByBranch/{branchId}',
        method: 'GET',
    };

    let testResource = new Resource<TestDataModel>('userNext', testResourceProps, testEnvironment);
    let testParameter: Array<ResourceParameters> = [{
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
    describe('Render when props changed', () => {
        let rendererInstance: PropsSetter;
        let elementNode: Element;
        beforeEach(() => {
            rendererInstance = TestUtils.renderIntoDocument(
                <PropsSetter>
                    <RestfulRender<TestDataModel>
                        resource={testResource}
                        parameters={testParameter}
                        render={render}
                    />
                </PropsSetter>
            ) as PropsSetter;
            elementNode = ReactDOM.findDOMNode(rendererInstance) as Element;
        });

        it('initialized', () => {
            expect(testEnvironment.fetch).toBeCalled();
        });

        it('rerender when resource changed', () => {
            testResource = new Resource<TestDataModel>('user', testResourceProps, testEnvironment);
            rendererInstance.setProps({
                resource: testResource,
                parameters: testParameter,
                render: render
            });
            expect(testEnvironment.fetch).toBeCalled();
        });

        it('rerender when parameters changed', () => {
            testParameter = [...testParameter];
            rendererInstance.setProps({
                resource: testResource,
                parameters: testParameter,
                render: (props) => {
                    const { data } = props;
                    return JSON.stringify(data);
                }
            });
            expect(elementNode.textContent).toEqual(`rerender when parameters changed; ${mockResponseData}`);
        });

        it('rerender when render changed', () => {
            rendererInstance.setProps({
                resource: testResource,
                parameters: testParameter,
                render: () => {
                    return 'rerender when render changed';
                }
            });
            expect(elementNode.textContent).toEqual('rerender when render changed');
        });
    });

});
