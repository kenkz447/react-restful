# react-restful
A library helps your manage data recevice from restful APIs and and render it into view.

[![NPM](https://nodei.co/npm/react-restful.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/react-restful/)

[![Build Status](https://travis-ci.org/kenkz447/react-restful.svg?branch=master)](https://travis-ci.org/kenkz447/react-restful)
[![Coverage Status](https://coveralls.io/repos/github/kenkz447/react-restful/badge.svg?branch=master)](https://coveralls.io/github/kenkz447/react-restful?branch=master)

## The simplest way to use

````typescript
/**
 * File: /src/restful/restful-environment.ts
 */

import { setupEnvironment } from 'react-restful';

setupEnvironment({
    entry: 'http//localhost:1337',
    beforeFetch: (url: string, requestInit: RequestInit) => {
        // Inject request headers here...
        return requestInit;
    },
    afterFetch: async (response) => {
        // Side-effects here
    }
})
````

````typescript
/**
 * file: /src/restful/resources/user.ts
 */ 

import {
    RecordType,
    Resource,
    ResourceType,
    getStore
} from 'react-restful';

export interface User extends RecordType {
    readonly id?: number;
    readonly name: string;
}

export const userResourceType = new ResourceType<User>({
    store: getStore(),
    name: 'User'
});

export const getUserById = new Resource<User>({
    resourceType: userResourceType,
    url: '/user/:id',
    mapDataToStore: (data, resourceType, store) => {
        store.dataMapping(resourceType, data);
    }
})
````

````tsx
/**
 * file: /src/components/UserContainer.tsx
 */ 

import * as React from 'react';
import { RestfulRender } from 'react-restful';

import { getUserById } from '/src/restful';

interface UserContainerProps {
    readonly userId: number;
}

export class UserContainer extends React.Component<UserContainerProps> {
    render() {
        const { userId } = this.props;
        return (
            <RestfulRender
                resource={getUserById}
                parameters={[{
                    type: 'path',
                    parameter: 'id',
                    value: userId
                }]}
            >
                {
                    (renderProps) => {
                        const { data, error, fetching } = renderProps;

                        if (!data) {
                            return null;
                        }

                        return <span>{data.name}</span>
                    }
                }
            </RestfulRender>
        );
    }
}
````
