# react-restful
Another liblary for restful resources management for React app.

[![NPM](https://nodei.co/npm/react-restful.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/react-restful/)

[![Build Status](https://travis-ci.org/kenkz447/react-restful.svg?branch=master)](https://travis-ci.org/kenkz447/react-restful)
[![Coverage Status](https://coveralls.io/repos/github/kenkz447/react-restful/badge.svg?branch=master)](https://coveralls.io/github/kenkz447/react-restful?branch=master)


<!-- TOC -->

- [react-restful](#react-restful)
    - [Why this is helpful?](#why-this-is-helpful)
    - [Demo](#demo)
    - [Quick start](#quick-start)
        - [Install and setup](#install-and-setup)
        - [Send a GET request](#send-a-get-request)
        - [Send POST, PUT or DELETE:](#send-post-put-or-delete)
        - [Sync restful data with view](#sync-restful-data-with-view)
    - [Documents](#documents)

<!-- /TOC -->

## Why this is helpful?

- Centralized all API resources in one place, for management and maintenance.
- Monitor data changes and automatically update view.
- Based on typescript, no redux.
- Easy to learn, simple integration without compromising performance.
- Small size bundle.

## Demo

See how react-restful work with simple CRUD app (thanks `strapi` and heroku for backend system).

[![Edit o4n7n0o7x6](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/o4n7n0o7x6)

## Quick start

### Install and setup

Install package from npm:

```bash
npm install react-restful
```

Create `restful` folder under `./src`, follow code:

```tsx
/**
 * file: /src/restful/environment.ts
 */
import { setupEnvironment } from 'react-restful';

const restfulEnv = setupEnvironment({
    /**
     * API's URI
     */
    entry: 'https://api.domain.com',
    /**
     *  Called before fetch the request
     *  Example: Init the bearer token into the header for authentication
     */
    beforeFetch: (url: string, requestInit: RequestInit) => {
        const token = getToken();
        if (token && requestInit.headers instanceof Headers) {
            requestInit.headers.append('Authorization', `Bearer ${token}`);
        }
        return requestInit;
    },
    /**
     * Called after the fetch
     */
    afterFetch: async (requestInfo) => {
        const { response } = requestInfo
        
        if (response.ok) {
            return;
        }

        const error = await response.json();
        console.error({
            error
        });
    }
});

const { request } = setupEnvironment;

// Using request to send PUT, POST or DELETE.
export const request = request;
```

And then, create `pet.ts`  file to define everything related to Pet API

```tsx
/**
 * file: /src/restful/resource/pet.ts
 */

import { Record, Resource, ResourceType } from 'react-restful';

/**
 * Data structure of Pet, 
 * extends Record needed
 */
export interface Pet extends Record {
  id?: number;
  name: string;
  desciption?: string;
}

/** 
 * All pet data has the same structure, 
 * we need to specify this structure (like a database table)
 * */
export const petResourceType = new ResourceType<Pet>('Pet');

/**
 * APIs with basic infomation
 */
export const petResources = {
    find: new Resource<Pet[]>({
        resourceType: petResourceType,
        url: '/pets'
    }),
    findById: new Resource<Pet[]>({
        resourceType: petResourceType,
        url: '/pets/:id'
    }),
    create: new Resource<Pet>({
        resourceType: petResourceType,
        method: 'POST',
        url: '/pets'
    }),
    update: new Resource<Pet>({
        resourceType: petResourceType,
        method: 'PUT',
        url: '/pets/:id'
    }),
    delete: new Resource<Pet>({
        resourceType: petResourceType,
        method: 'DELETE',
        url: '/pets/:id'
    })
};
```

Export via `index.ts`

```tsx
/**
 * file: /src/restful/index.ts
 */

export * from './resful-environment';
export * from './resources/pet';
```

### Send a GET request

```tsx
import { RestfulRender, RestfulComponentRenderProps } from 'react-restful';

import { petResources } from '../restful';

export class PetContainer extends React.Component {
    render() {
        return (
            <RestfulRender
                resource={petResources.find}
                render={this.renderList}
            />
        );
    }

    renderList = (renderProps: RestfulComponentRenderProps<Pet[]>) => {
        const { data, error, fetching } = renderProps;

        if(error) {
            return 'error!';
        }

        if (!data) {
            return 'loading...';
        }

        return <PetList pets={data} showLoading={fetching} />;
    };
}
```
In case you want send GET request with query string e.g: `/pets?name='micky'`

```tsx
    <RestfulRender
        resource={petResources.find}
        parameters={{
            type: 'query',
            parameter: 'name',
            value: 'micky'
        }}
        render={this.renderList}
    />
```

Or more than one `/pets?name='micky'&type='mouse'`

```tsx
const parameters: RequestParams = [{
    type: 'query',
    parameter: 'name',
    value: 'micky'
}, {
    type: 'query',
    parameter: 'type',
    value: 'mouse'  
}];
```
With `findById` resource in above, use param type `path` to replace `/:id` with object's id:

```tsx
// Form "/pets/:id"
// To "/pets/1"

const parameter: RequestParameter = {
    type: 'path',
    parameter: 'id',
    value: 1
};
```

### Send POST, PUT or DELETE:

```tsx
import { RequestParams } from 'react-restful';
import { request, petResources } from '../restful';

const createNewPet = async () => {
    const requestParams: RequestParams = {
        type: 'body',
        value: {
            name: 'tom',
            type: 'cat'
        }
    };

    const newPet = await request(petResources.create, requestParams);
    return newPet;
}

const updatePet = async () => {
    import { RequestParams } from 'react-restful';

    const requestParams: RequestParams = [{ 
            type: 'path', 
            parameter: 'id', 
            value: 1 
        },
        { 
            type: 'body', 
            value: { name: 'change pet name to abc'}
        }];

    const updatedPet = await request(petResources.update, requestParams);
    return updatedPet;
};

const deletePet = async () => {
    const { pet } = this.props;

    await request(petResources.delete, {
        type: 'path',
        parameter: 'id',
        value: 1
    });
};
```

### Sync restful data with view

We need to create Higher Order Component to render Child Component every time data(passed down from RestfulRender ) changes,
including create, update or delete event.

```tsx
import { withRestfulData } from "react-restful";

import { Pet, petResourceType } from "../restful";

interface PetListsProps {
    showLoading: boolean;
    pets: Array<Pet>;
}

// Component to display list of pet
function PetListComponent(props: PetListsProps) {
  return // ...
}

export const PetList = withRestfulData<Pet, PetListsProps>({
    resourceType: petResourceType,
    registerToTracking: (
        ownProps: PetListsProps,
        trackedPets: Array<Pet>,
        event: SubscribeEvent<Pet>
    ) => {
        if (trackedPets && trackedPets.length) {
            return trackedPets;
        }
        
        return ownProps.pets;
    },
    mapToProps: (
        pets: Array<Pet>,
        ownProps: PetListsProps
    ) => {
        return {
            pets: pets
        };
    }
})(PetListComponent);
```

Checkout the demo above to more details.

## Documents

On progress...

- [Check out github wiki](https://github.com/kenkz447/react-restful/wiki)


