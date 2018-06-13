import { mockResponseOnce } from 'jest-fetch-mock';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';
import {
    createEnvironment,
    Resource,
    ResourceParameters,
    ResourceProps
    } from '../../utilities';
import { RestfulRender } from '../RestfulRender';

interface TestDataModel {

}

interface TestDataResponse {

}

describe('RestfulRender', () => {
    class PropsSetter extends React.PureComponent {
        state: {
            props: Object | null
        };

        constructor(props: Object) {
            super(props);
            this.state = {
                props: null,
            };
        }

        setProps(props: {}) {
            this.setState({ props });
        }
        render() {
            const child = React.Children.only(this.props.children);
            if (this.state.props) {
                return React.cloneElement(child, this.state.props as Object);
            }
            return child;
        }
    }

    const testEnvironment = createEnvironment({
        fetch: (url, requestInit) => {
            return fetch(url, requestInit as RequestInit);
        }
    });
    const mockResponseData = JSON.stringify([{ id: '12345' }, { id: '12346' }]);
    mockResponseOnce(mockResponseData);

    const testResourceProps: ResourceProps = {
        url: '/api/getUsersByBranch/{branchId}',
        method: 'GET',
    };

    const testResource = new Resource<TestDataModel, TestDataResponse>(testResourceProps, testEnvironment);
    const testParameter: Array<ResourceParameters> = [{
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

    let rendererInstance: React.ReactInstance;

    beforeEach(() => {
        rendererInstance = TestUtils.renderIntoDocument(
            <PropsSetter>
                <RestfulRender<TestDataModel, TestDataResponse>
                    resource={testResource}
                    parameters={testParameter}
                    render={() => {
                        return 'Loading...';
                    }}
                />
            </PropsSetter>
        ) as React.ReactInstance;
    });

    it('initialized', () => {
        const elementNode = ReactDOM.findDOMNode(rendererInstance) as Element;
        expect(elementNode.textContent).toEqual('Loading...');
    });
});
