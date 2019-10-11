import * as React from 'react';

import * as testRenderer from 'react-test-renderer';
import { RestfulMutate, RestfulMutateProps } from '../RestfulMutate';
import { User } from '../../test-resources';
import { Resource, setupEnvironment, Store } from '../../core';

describe('RestfulMutate', () => {
    const onConfirm = jest.fn(() => true);
    setupEnvironment({
        store: new Store(),
        onConfirm: onConfirm
    });

    const renderChild = jest.fn((props) => <button>button</button>);
    const requestHelperProps: RestfulMutateProps<User> = {
        resource: new Resource('/user'),
        children: (props) => {
            return renderChild(props);
        }
    };

    const element = testRenderer.create(
        <RestfulMutate
            {...requestHelperProps}
        />
    );

    // tslint:disable-next-line:no-any
    const requestHelperInstance: RestfulMutate<User, {}> = element.getInstance() as any;

    it('render without error!', () => {
        expect(renderChild).toBeCalledWith({
            sending: false,
            sendRequest: requestHelperInstance.sendRequest
        });
    });

    it('send request with default params!', () => {
        jest.clearAllMocks();

        requestHelperInstance.sendRequest();
        expect(renderChild).toBeCalledWith({
            sending: true,
            sendRequest: requestHelperInstance.sendRequest
        });
    });

    it('should confirm', () => {
        jest.clearAllMocks();

        element.update((
            <RestfulMutate
                {...requestHelperProps}
                confirmMessage="confirm?"
            />
        ));
        
        requestHelperInstance.sendRequest();

        expect(onConfirm).toBeCalled();
    });
});