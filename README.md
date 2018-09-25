# react-restful
A library helps your manage data recevice from restful APIs and and render it into view.

[![NPM](https://nodei.co/npm/react-restful.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/react-restful/)

[![Build Status](https://travis-ci.org/kenkz447/react-restful.svg?branch=master)](https://travis-ci.org/kenkz447/react-restful)
[![Coverage Status](https://coveralls.io/repos/github/kenkz447/react-restful/badge.svg?branch=master)](https://coveralls.io/github/kenkz447/react-restful?branch=master)

## The simplest way to use

````typescript
// file: /restful/restful-environment.ts

import { Store, Fetcher } from 'react-restful';
import * as Cookies from 'js-cookie';

export const restfulStore = new Store();

export const restfulFetcher = new Fetcher({
    store: restfulStore,
    beforeFetch: (url: string, requestInit: RequestInit) => {
        if (requestInit.headers instanceof Headers) {
            const token = Cookies.get('token');
            if (token) {
                requestInit.headers.append('Authorization', `Bearer ${token}`);
            }
        }

        return requestInit;
    },
    afterFetch: async (response) => {
        if (response.ok) {
            return;
        }

        const error = await response.text();
        console.error(error);
    }
});

export const apiEntry = (path: string) => `http//localhost:1337${path}`;
````

````typescript
// file: /restful/resources/user.ts

import {
    RecordType,
    Resource,
    ResourceType
} from 'react-restful';

import { apiEntry, restfulStore } from '@/restful/restful-environment';

export interface User extends RecordType {
    readonly id: number;
    readonly name: string;
    readonly email: string;
}

export const userResourceType = new ResourceType<User>({
    store: restfulStore,
    name: 'User'
});

export const userResources = {
    getCurrentUserByToken: new Resource<User>({
        resourceType: userResourceType,
        url: apiEntry('/accountservice/api/account'),
        method: 'GET',
        mapDataToStore: (data, resourceType, store) => {
            store.dataMapping(resourceType, data);
        }
    })
};
````

````tsx
// file: /components/User.tsx

import * as React from 'react';
import { RestfulRender } from 'react-restful';

import { userResources, restfulStore,restfulFetcher } from '@/restful';

import { CustomerList } from './customer-container';

export class CustomersContainer extends React.PureComponent {
    public render() {
        return (
            <RestfulRender
                store={restfulStore}
                fetcher={restfulFetcher}
                resource={userResources.getCurrentUserByToken}
                render={(renderProps) => {
                    const { data } = renderProps;

                    if (!data) {
                        return null;
                    }

                    return <span>{data.name}</span>
                }}
            />
        );
    }
}
````
