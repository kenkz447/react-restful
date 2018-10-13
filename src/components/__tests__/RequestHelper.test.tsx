import * as React from 'react';

import * as testRenderer from 'react-test-renderer';
import { RequestHelper, RequestHelperProps } from '../RequestHelper';
import { User } from '../../test-resources';
import { Resource, setupEnvironment, Store } from '../../utilities';

describe('RequestHelper', () => {
    const onConfirm = jest.fn(() => true);
    setupEnvironment({
        store: new Store(),
        onConfirm: onConfirm
    });

    const renderChild = jest.fn((props) => <button>button</button>);
    const requestHelperProps: RequestHelperProps = {
        resource: new Resource<User>('/user'),
        children: (props) => {
            return renderChild(props);
        }
    };

    const element = testRenderer.create(
        <RequestHelper
            {...requestHelperProps}
        />
    );

    // tslint:disable-next-line:no-any
    const requestHelperInstance: RequestHelper<User, {}> = element.getInstance() as any;

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
            <RequestHelper
                {...requestHelperProps}
                confirmMessage="confirm?"
            />
        ));
        
        requestHelperInstance.sendRequest();

        expect(onConfirm).toBeCalled();
    });
});