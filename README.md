# react-restful
Another liblary for restful resources management for React app.

[![NPM](https://nodei.co/npm/react-restful.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/react-restful/)

[![Build Status](https://travis-ci.org/kenkz447/react-restful.svg?branch=master)](https://travis-ci.org/kenkz447/react-restful)
[![Coverage Status](https://coveralls.io/repos/github/kenkz447/react-restful/badge.svg?branch=master)](https://coveralls.io/github/kenkz447/react-restful?branch=master)

![readme.png](https://2.pik.vn/2018d9c3d431-98f3-4de3-8189-9332ee83ddc2.png)

## The simplest way to use

Minimum setup (for most projects), "keep it simple stupid" is a best in development process.

### Setup

To start, you need create `restful` folder at somewhere in your project. I perfer prefer under `/src`.

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
Define your first API resource, how about an appication to manage `pets` a in pet store?

````typescript
/**
 * File: /src/restful/resources/pet.ts
 */ 

import {
    RecordType,
    Resource,
    ResourceType,
    getStore
} from 'react-restful';

export interface Pet extends RecordType {
    id?: number;
    name: string;
    desciption?: string;
}

export const petResources = {
    // API to get list of pet
    find: new Resource<Pet[]>('/pet'),
}
````
Export `pet.ts` via `/src/restful/index.ts`, don't forget import `restful-environment.ts` at top of `/src/restful/index.ts` file.

```ts
/**
 * File: /src/restful/index.ts
 */

export * from './restful-environment.ts';
export * from './resources/user.ts';

```

### Implememnt

First, using `RestfulRender` to send GET request to get list of user,
Then passed down response data to `UserList`

````tsx
/**
 * File: /src/components/PetContainer.tsx
 */ 

import * as React from 'react';
import { RestfulRender, request } from 'react-restful';

import { petResources } from '/src/restful';
import { PetList } from './PetList.tsx'

export class PetContainer extends React.Component {
    render() {
        return (
            <RestfulRender
                resource={petResources.find}
            >
                {
                    ({ data }) => {
                        if (!data) {
                            return null;
                        }

                        return (<PetList pets={data}/>)
                    }
                }
            </RestfulRender>
        );
    }
}
````
Component to render data:

````tsx
/**
 * File: /src/components/PetContainer.tsx
 */ 

import * as React from 'react';
import { request } from 'react-restful';

import { petResources, Pet } from '/src/restful';
import { PetItem } from './PetItem';

interface PetListProps {
    pets: Pet[];
}

export class PetList extends React.Component<PetListProps> {
    render() {
        const { pets } = this.props;
        return (
            <ul className="peting-list">
                { 
                    pets.map(pet => <PetItem key={pet.id} pet={pet}/>) 
                }
            </ul>
        );
    }
}
````

And display peting info via `PetItem`

````tsx
/**
 * File: /src/components/PetItem.tsx
 */ 

import * as React from 'react';

import { petResources, Pet } from '/src/restful';

interface PetItemProps {
    pets: Pet;
}

export class PetItem extends React.Component<PetItemProps> {
    render() {
        <li className="peting-item">
            <h4>#{pet.id}</h4>
        </li>
    }
}
````

End yet? not yet. You have just undergone 'R' in the CRUD definition. Look down below to see how to complete the process:

1. add three resources:
```diff
/**
 * File: /src/components/PetContainer.tsx
 */

export const petResources = {
    // API to get list of pet
    find: new Resource<Pet[]>('/pet'),
+   create: new Resource<Pet>({
+       method: 'POST',
+       url: '/user'
+}),
+   update: new Resource<Pet>({
+       method: 'PUT',
+       url: '/user'
+}),
+   delete: new Resource<Pet>({
+       method: 'DELETE',
+       url: '/user/:id'
+})
}
```

2. Add `delete` and `update` methods in `PetItem`

```diff
/**
 * File: /src/components/PetItem.tsx
 */
import * as React from 'react';
+ import { request } from 'react-restful';

import { petResources, Pet } from '/src/restful';

export class PetItem extends React.Component<PetItemProps> {
+   input: HTMLInputElement;

    render() {
        <li className="peting-item">
            <h4>#{pet.id}</h4>
+           <form onSubmit={this.handleSubmit}>
+               <label>
+                   Name: <input type="text" ref={(input) => this.input = input} />
+               </label>
+               <input type="submit" value="Submit" />
+               <a onClick={this.handleDelete}>Delete this pet</a>
+           </form>
        </li>
    }

+   handleSubmit = async (event) => {
+       const { pet } = this.props;

+      const updatePet = {
+           ...pet,
+           name: this.input.value
+      }; 
+
+      await request(petResources.update, [{ type: 'body', value: updatePet }])
+   }

+   handleDelete = (event) => {
+       const { pet } = this.props;
+
+       await request(
+           petResources.delete, 
+           [{ 
+               type: 'path',
+               parameter: 'id,
+               value: pet 
+           }]
+        );
+   }
}
```

...