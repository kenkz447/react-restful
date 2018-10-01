# react-restful
Another liblary for restful resources management for React app.

[![NPM](https://nodei.co/npm/react-restful.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/react-restful/)

[![Build Status](https://travis-ci.org/kenkz447/react-restful.svg?branch=master)](https://travis-ci.org/kenkz447/react-restful)
[![Coverage Status](https://coveralls.io/repos/github/kenkz447/react-restful/badge.svg?branch=master)](https://coveralls.io/github/kenkz447/react-restful?branch=master)


![readme.png](https://2.pik.vn/2018d9c3d431-98f3-4de3-8189-9332ee83ddc2.png)*Are you familiar with Swagger?*

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

Install package from npm:

```bash
npm install react-restful
```

Create `restful` folder under `./src`, follow code:

```ts
/**
 * file: /src/restful/environment.ts
 */
import { setupEnvironment } from "react-restful";

setupEnvironment({
    /**
     * Your base API endpoint,
     * will using for all requests
     */
    entry: "https://api.domain.com",
    /**
     *  Inject `Bearer token` to header or do anything
     *  before sending request...
     */
    beforeFetch: (url: string, requestInit: RequestInit) => {
        return requestInit;
    },
    /**
     * Something happen here when request failed!
     */
    afterFetch: async (response: Response) => {
        if (response.ok) {
            return;
        }

        const error = await response.json();
        console.error({
            error
        });
    }
});
```

And then, create `pet.ts`  file to define everything related to Pet API

```ts
/**
 * file: /src/restful/resource/pet.ts
 */

import { RecordType, Resource, ResourceType } from "react-restful";

/**
 * Data structure of Pet, 
 * extends RecordType needed
 */
export interface Pet extends RecordType {
  id?: number;
  name: string;
  desciption?: string;
}

/** 
 * All pet data has the same structure, 
 * we need to specify this structure (like a database table)
 * */
export const petResourceType = new ResourceType<Pet>("Pet");

/**
 * APIs with basic infomation
 */
export const petResources = {
    find: new Resource<Pet[]>({
        resourceType: petResourceType,
        url: "/pets"
    }),
    findById: new Resource<Pet[]>({
        resourceType: petResourceType,
        url: "/pets/:id"
    }),
    create: new Resource<Pet>({
        resourceType: petResourceType,
        method: "POST",
        url: "/pets"
    }),
    update: new Resource<Pet>({
        resourceType: petResourceType,
        method: "PUT",
        url: "/pets/:id"
    }),
    delete: new Resource<Pet>({
        resourceType: petResourceType,
        method: "DELETE",
        url: "/pets/:id"
    })
};
```

Export via `index.ts`

```ts
/**
 * file: /src/restful/index.ts
 */

export * from "./resful-environment";
export * from "./resources/pet";
```

Checkout the demo above to find out how to use these resource.

## Document

On progress...