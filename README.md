<div align="center" class="cover">

[![FluxModels](https://raw.githubusercontent.com/fluxmodels/fluxmodels/main/docs/images/cover.png)](https://fluxmodels.dev/)

type-safe state management

---

[![website](https://img.shields.io/badge/Docs-fluxmodels.dev-2ea845?style=flat&labelColor=202020)](https://fluxmodels.dev/) [![metatyper website](https://img.shields.io/badge/Docs-metatyper.dev-2ea845?style=flat&labelColor=202020)](https://metatyper.dev/) [![license: MIT](https://img.shields.io/badge/License-MIT-00aa00.svg?style=flat&labelColor=202020)](https://opensource.org/licenses/MIT) [![donate](https://img.shields.io/badge/Donate-PayPal-ff3f59.svg?style=flat&labelColor=202020)](https://paypal.me/vadzimsharai)

</div>

&nbsp;

# Introduction

FluxModels is a modern state management library designed to simplify frontend development. It offers a type-safe and efficient solution for managing application states, with a focus on developer productivity. FluxModels provides intuitive APIs and reactive programming concepts, making it easier to build and maintain complex applications while keeping your codebase clean and organized.

Key Features:

- 🔄 Seamless Reactivity: Experience real-time UI updates that sync perfectly with your state changes.
- 🛡️ Bulletproof Type Safety: Harness TypeScript's full potential with runtime validation and serialization.
- ⚡ Blazing-Fast Performance: Benefit from optimized updates and re-renders that keep your app snappy.
- 🔀 Effortless Async Handling: Tackle complex asynchronous workflows with elegant simplicity.

FluxModels goes beyond traditional state management. By integrating state management with data validation and serialization, this library provides a comprehensive solution that addresses two key challenges in modern web development.

Ready to supercharge your frontend development? Dive into FluxModels and experience the future of state management today!

&nbsp;

# Packages

| Name | Version | Description |
| :--- | :------ | :---------- |
| [`@fluxmodels/react`](https://github.com/fluxmodels/fluxmodels/tree/main/packages/react)  | [![npm react](https://img.shields.io/npm/v/@fluxmodels/react?style=flat&labelColor=202020&label=NPM(React))](https://www.npmjs.com/package/@fluxmodels/react) | React hooks and tools  |
| [`@fluxmodels/core`](https://github.com/fluxmodels/fluxmodels/tree/main/packages/core)    | [![npm core](https://img.shields.io/npm/v/@fluxmodels/core?style=flat&labelColor=202020&label=NPM(Core))](https://www.npmjs.com/package/@fluxmodels/core)         | Core functionality |

&nbsp;

# Installation

React:

```bash
npm install @fluxmodels/react
# or
yarn add @fluxmodels/react
```

Core:

```bash
npm install @fluxmodels/core
# or
yarn add @fluxmodels/core
```

&nbsp;

## TypeScript configuration

To use FluxModels with TypeScript, you need to enable experimental decorators and emit decorator metadata in your `tsconfig.json` file.

Add the following configurations:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        // ... other options
    }
}
```

These settings allow TypeScript to properly handle the decorators used in FluxModels and ensure full functionality of the library.

&nbsp;

# Basic Usage (React)

```jsx
import React from 'react'
import { useModel } from '@fluxmodels/react'

const UserModel = {
    username: ''
}

function UsernameInput() {
    const [user, updateUser] = useModel(UserModel)

    return <input 
        value={user.username} 
        onChange={(e) => 
            updateUser({ username: e.target.value })
        } 
    />
}

function App() {
    return <UsernameInput />
}
```

&nbsp;

More complex example:

```jsx
import React, { Suspense } from 'react'

import { STRING } from 'metatyper'
import { useModel, OnInit, UseSuspense, getKey, InjectModelArray } from '@fluxmodels/react'
```

```jsx
class ProductModel {
    id = ''
    name = STRING({ maxLength: 12, default: '' })
}

class UserModel {
    id = ''
    username = STRING({ maxLength: 12, default: '' })

    products = InjectModelArray(ProductModel, ({ item }) => ({ key: item.id }))

    async loadUserData({ userID }) {
        // Here could be your API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const userData = {
            id: userID,
            username: 'user_' + userID,
            products: [
                { id: '1', name: 'Product 1' },
                { id: '2', name: 'Product 2' },
                { id: '3', name: 'Product 3' },
            ]
        }

        Object.assign(this, userData)
    }

    @OnInit() // calc this before render
    @UseSuspense() // will use Suspense until loaded
    async loadUser() {
        const userID = getKey(this)

        await this.loadUserData({ userID })
    }
}
```

```jsx
function ProductComponent({ name }) {
    return <div>Product: {name}</div>
}

function UserComponent({ userID }) {
    const [user] = useModel(UserModel, { key: userID })

    return (
        <div>
            <p>ID: {user.id}</p>
            <p>Username: {user.username}</p>

            <p>Products:</p>

            {user.products.map((product) => (
                <ProductComponent key={product.id} name={product.name} />
            ))}

            <br />
            <button onClick={() => user.loadUser()}>Load user again</button>
        </div>
    )
}
```

```jsx
function App() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <UserComponent userID="1" />
            <br />
            <UserComponent userID="2" />
        </Suspense>
    )
}
```

&nbsp;

# Table of Contents

- [Introduction](#introduction)
- [Packages](#packages)
- [Installation](#installation)
  - [TypeScript configuration](#typescript-configuration)
- [Basic Usage (React)](#basic-usage-react)
- [Table of Contents](#table-of-contents)
- [Documentation](#documentation)
  - [React](#react)
    - [useModel](#usemodel)
    - [React Suspense and UseSuspense](#react-suspense-and-usesuspense)
    - [useModelsStore and ModelsStoreProvider](#usemodelsstore-and-modelsstoreprovider)
  - [Core](#core)
    - [Model](#model)
    - [State and StateManager](#state-and-statemanager)
    - [StateProxy and StateProxyManager](#stateproxy-and-stateproxymanager)
    - [Observable Properties](#observable-properties)
    - [Injected States (InjectModel)](#injected-states-injectmodel)
    - [Injected States Arrays (InjectModelArray)](#injected-states-arrays-injectmodelarray)
    - [Models Store](#models-store)
    - [Event Handling with EventsManager](#event-handling-with-eventsmanager)
    - [Utils and Tools](#utils-and-tools)
      - [UseLoader](#useloader)
    - [Runtime Validation/Serialization](#runtime-validationserialization)
- [Similar Libraries](#similar-libraries)
- [Change Log](#change-log)

&nbsp;

# Documentation

## React

React package contains the React hooks and tools for FluxModels.

### useModel

The `useModel` hook is a core feature of FluxModels for React applications.
It connects React components to states, enabling reactive updates and efficient re-renders.

`useModel` takes two arguments:

1. `model`: A class or object model (see [Model](#model) for more details)
2. `args` (optional): An object with the following properties:
    - `key`: `any` - Identifier for the state in the store
    - `store`: `ModelsStore` - Custom models store (see [Models Store](#models-store))
    - `keyEqual`: `(existsKey: string, searchKey: string) => boolean` - Custom key equality function
    - `observeProps`: `ObservablePropsArgsType` - Properties to observe (see [Observable Props](#observable-properties))
    - `autoResolveObservableProps`: `boolean` - Controls automatic resolution of observable props (default: `true`)
    - `disableSuspense`: `boolean` - Disables [UseSuspense](#react-suspense-and-usesuspense) functionality if `true`

`useModel` returns a tuple, just like React's useState:

1. A frozen state snapshot (read-only version of the model state)
2. An update function

You can update the state in two ways:

1. Using the returned update function (e.g., `updateUser`)
2. Calling model actions (e.g., `user.updateUsername`)

Example:

```jsx
const UserModel = {
    username: '',
    updateUsername(newUsername) {
        this.username = newUsername
    }
}

// -------------------------------------------

const [user, updateUser] = useModel(UserModel)

// Update the model
updateUser({ username: 'Felix' })

// Or by action (model method)
user.updateUsername('Felix')
```

> Modifying this.username updates the state and triggers re-renders,
> but doesn't directly change the original model object

&nbsp;

### React Suspense and UseSuspense

React Suspense is a feature that allows you to suspend the rendering of a component until a certain condition is met.
In FluxModels, it is used to suspend the rendering of a component until an async method decorated with @UseSuspense has been resolved.

Example:

```jsx
class MyModel {
    @UseSuspense()
    async load() {
        // DO something
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }
}

function MyComponent() {
    const [state] = useModel(MyModel)

    return <div>
        OK
        <button onClick={() => state.load()}>Load</button>
    </div>
}

function App() {
    // Loading... will be shown after the button is clicked and until state.load is resolved.

    return <Suspense fallback={<p>Loading...</p>}>
        <MyComponent />
    </Suspense>
}
```

One more example:

You can use `UseSuspense` decorator with `OnInit` decorator to load data on state initialization:

```jsx
class MyModel {
    @OnInit()
    @UseSuspense()
    async load() {
        // DO something
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }
}

function MyComponent() {
    const [state] = useModel(MyModel)

    return <div>OK</div>
}

function App() {
    // Loading... will be shown at first render and until state.load is resolved

    return <Suspense fallback={<p>Loading...</p>}>
        <MyComponent />
    </Suspense>
}
```

&nbsp;

### useModelsStore and ModelsStoreProvider

The `ModelsStoreProvider` is a React component that creates a context for the ModelsStore, making it available to all child components.
The `ModelsStoreProvider` component is used to provide a shared state for a component subtree. Multiple `ModelsStoreProvider`s can be used for different subtrees, and they can even be nested.
This works similarly to React Context. If a model is used in a component tree without a `ModelsStoreProvider`,
it will use the default `ModelsStore`. This is called the provider-less mode.

`useModelsStore` is a hook that allows you to access the current `ModelsStore` within a React component. It's typically used in conjunction with the `ModelsStoreProvider` to manage and share state across your application.

Example:

```jsx
const UserComponent = () => {
    const [user] = useModel(UserModel)

    return <div>User: {user.username}</div>
}

const store = new ModelsStore()

function App() {
    return (
        <>
            <UserComponent />

            <ModelsStoreProvider store={store}>
                <UserComponent />
            </ModelsStoreProvider>
        </>
    )
}
```

&nbsp;

## Core

Core package contains the core functionality of FluxModels. It is a standalone library that can be used without React.

### Model

Model is a class or object that describes the [state](#state-and-statemanager) and state actions (methods).

It's like prototype of the state. You can create a lot of instances of the model and they will be independent.
To describe the model you need to use props with values and types from [Metatyper](https://www.npmjs.com/package/metatyper).
Also you can use [Injected Models](#injected-models) to create nested states.

> Any class or object can be a model

Example:

```ts
import { NUMBER, STRING } from 'metatyper'

class UserModel {
    id = NUMBER({ min: 0, optional: true })
    username = STRING({ maxLength: 12, default: '' })
}

const UserModel2 = {
    id: NUMBER({ min: 0, optional: true }),
    username: STRING({ maxLength: 12, default: '' })
}

const userState = StateManager.createState(UserModel) 
// creates a new instance of UserModel

const userState2 = StateManager.createState(UserModel2) 
// creates a deepcopy of UserModel2
```

&nbsp;

### State and StateManager

State and StateManager are core concepts in FluxModels:

State:

- Represents an instance of a model
- Created by the StateManager
- Acts as a proxy object that:
  - Tracks changes
  - Performs validation and serialization
  - Invokes handlers (added via [@On{EventName}](#event-handling-with-eventsmanager) decorators or StateProxy mounting)

StateManager:

- Responsible for managing the lifecycle of states
- Key functionalities include:
  - Creating new states
  - Searching for existing states
  - Managing state metadata
  - Handling state operations and updates

For an in-depth look we recommend exploring the [source code](https://github.com/fluxmodels/fluxmodels/tree/main/packages/core/src/StateManager.ts).

&nbsp;

### StateProxy and StateProxyManager

The StateProxyManager is a crucial component responsible for managing the lifecycle of state proxies in FluxModels.

A StateProxy serves as a reactive wrapper around a state object, acting as a bridge between the [State](#state-and-statemanager) and view components (e.g., React components). It enables efficient, reactive data management by ensuring that when observable properties change, all associated views are re-rendered.

Key features of StateProxy:

1. Observable Property Marking: Identifies which state properties should trigger updates.
2. Re-render Management: Handles component re-renders through mount/unmount operations.
3. Snapshot Creation: Generates immutable copies of the state for side-effect-free operations.

Lifecycle of a StateProxy:

1. Creation: Typically initiated by hooks like `useModel` in React.
2. Mounting: Occurs when a view component mounts, attaching re-render functions to observable property changes.
3. Unmounting: Happens when a view component unmounts, cleaning up listeners.
4. Snapshot Creation: Can be created on-demand (e.g., returned by the `useModel` hook in React).

The StateProxyManager oversees these proxies, handling change events and managing their overall lifecycle.

&nbsp;

### Observable Properties

Observable properties are a key feature in FluxModels, allowing for fine-grained reactivity:

- They are specific state properties that the StateProxy monitors.
- Changes to observable properties emit events, triggering re-renders in associated components.
- This selective approach ensures efficient updates, re-rendering only when necessary.

Setting Observable Properties:

- Explicit Declaration: Use the `observeProps` argument (e.g., in the `useModel` hook).

```ts
import { InjectModel } from '@fluxmodels/core'

class ProfileModel {
    fullName = ''
}

class UserModel {
    username = ''
    profile = InjectModel(ProfileModel)

    passwordHash = ''
}

// -------------------------------------------

import { useModel } from '@fluxmodels/react'

const Component = () => {
    const [user, updateUser] = useModel(UserModel, {
        observeProps: { 
            username: true, 
            passwordHash: false, 
            profile: ['fullName']  // or { fullName: true }
        }
    })

    return <div>
        ...
    </div>
}
```

> You can use nested arrays or objects to observe InjectedModel properties (like `profile` in the example above).

> Also you can use false to not observe properties in any case.

- Implicit Declaration: Properties become observable when accessed via the state proxy.

```ts
const username = user.username; // 'username' is now an observable property
```

By leveraging observable properties, FluxModels provides a powerful yet flexible system for managing state updates and component re-renders, allowing developers to create highly responsive and efficient applications.

&nbsp;

### Injected States (InjectModel)

Creates a dynamic property that returns a state (either new or from the store).
When the property is accessed, it calls StateManager.getOrCreateState() with the provided model and arguments.

InjectModel accepts two arguments:

1. `model`: A class or object model (see [Model](#model) for more details)
2. `args` (optional): An object with the following properties:
    - `key`: `any` - Identifier for the state in the store
    - `store`: `ModelsStore` - Custom models store (see [Models Store](#models-store))
    - `keyEqual`: `(existsKey: string, searchKey: string) => boolean` - Custom key equality function
    - `observeProps`: `ObservablePropsArgsType` - Properties to observe (see [Observable Props](#observable-properties))
    - `autoResolveObservableProps`: `boolean` - Controls automatic resolution of observable props (default: `true`)
    - `disableSuspense`: `boolean` - Disables [UseSuspense](#react-suspense-and-usesuspense) functionality if `true`

> `key` accepts INJECT_KEY symbol to also inject the parent state key.

> `store` accepts INJECT_STORE symbol to also inject the parent state store.

> `model` and `args` can be functions that will be called each time the property is accessed.

Basic usage:

```ts
class UserProfile {
  name = ''
}

class UserWithProfile {
  profile = InjectModel(UserProfile)
}
```

Usage with dynamic model and key selection:

```ts
import { InjectModel } from '@fluxmodels/core'

class UserProfile {
  name = ''
}

class AdminProfile {
  name = ''
  adminRole = 'default'
}

class UserWithProfile {
  userType = 'default'

  profile = InjectModel(
    (state: UserWithProfile) => state.userType === 'admin' ? AdminProfile : UserProfile,
    (state: UserWithProfile) => ({ key: `${state.userType}:${getKey(state)}` })
  )
}
```

State management and reactivity:

```ts
import { StateManager, StateProxyManager } from '@fluxmodels/core'

const [userState] = StateManager.getOrCreateState(UserWithProfile)
const userStateProxy = StateProxyManager.createStateProxy(userState)

userStateProxy.mount(function rerender() {
  // This function will be called when userState or its injected states change
  console.log('User state updated')
})

// This is similar to a `useModel` hook in `@fluxmodels/react`
// In a React component, userStateProxy.mount would be called during component mounting
// The rerender function passed to mount will be triggered on state changes,
// causing the component to re-render and reflect the updated state

const profileState = userState.profile
profileState.name = 'John' // This will trigger the mounted function above
```

&nbsp;

### Injected States Arrays (InjectModelArray)

Creates a dynamic property that returns an array of states (either new or from the store).
When the property is changed, it calls StateManager.getOrCreateState() for each item in the array with the provided model and arguments.

InjectModelArray accepts two arguments:

1. `model`: A class or object model (see [Model](#model) for more details)
2. `args` (optional): An object with the following properties:
    - `key`: `any` - Identifier for the state array in the store
    - `store`: `ModelsStore` - Custom models store (see [Models Store](#models-store))
    - `keyEqual`: `(existsKey: string, searchKey: string) => boolean` - Custom key equality function
    - `observeProps`: `ObservablePropsArgsType` - Properties to observe (see [Observable Props](#observable-properties))
    - `autoResolveObservableProps`: `boolean` - Controls automatic resolution of observable props (default: `true`)
    - `disableSuspense`: `boolean` - Disables [UseSuspense](#react-suspense-and-usesuspense) functionality if `true`

> `store` accepts INJECT_STORE symbol to also inject the parent state store.

> `model` and `args` can be functions that will be called for each item in the array when the property is accessed.
> These functions receive additional parameters: `item` (the current array item) and `index` (the index of the current item in the array).

Basic usage:

```ts
class UserProfile {
  name = ''
}

class UserWithProfiles {
  profiles = InjectModelArray(UserProfile)
}
```

Usage with dynamic model and key selection:

```ts
import { InjectModelArray } from '@fluxmodels/core'

class PrivateProject {
  id = ''
  name = ''
}

class PublicProject {
  id = ''
  name = ''
  isPublic = true
  publicField = 'public'
}

class UserWithProjects {
  id = ''

  projects = InjectModelArray<PublicProject | PrivateProject>(
    ({ item, index, state }) => item.isPublic ? PublicProject : PrivateProject,
    ({ item: project, index, state: user }) => ({ key: `${user.id}:${project.id}` })
  )
}
```

State management and reactivity:

```ts
import { StateManager, StateProxyManager } from '@fluxmodels/core'

const [userState] = StateManager.getOrCreateState(UserWithProfile)
const userStateProxy = StateProxyManager.createStateProxy(userState)

userStateProxy.mount(function rerender() {
  // This function will be called when userState or its injected states change
  console.log('User state updated')
})

// This is similar to a `useModel` hook in `@fluxmodels/react`
// In a React component, userStateProxy.mount would be called during component mounting
// The rerender function passed to mount will be triggered on state changes,
// causing the component to re-render and reflect the updated state

userState.id = '1'
userState.projects = [
    { id: '1', name: 'Project 1', isPublic: true },
    { id: '2', name: 'Project 2' },
] // This will trigger the mounted function above

userState.projects[0].name = 'Project 11' // This also will trigger the mounted function above

userState.projects = []  // And this will also trigger the mounted function above
```

> userState.projects.push unavailable, because `projects` is frozen array

&nbsp;

### Models Store

ModelsStore is a simple storage to store states.

You can implement your own store if you don't want to use the default one.

Available methods:

- findState - find state by model and keyFindFunc
- getStates - get all states by model (and may be filtered by `keyFilterFunc`)
- addState - add state to the store
- clearStore - clear the store

> key may be any value

> keyFindFunc - function that should return true if the existsKey is target key

For more details on the implementation, see the [StateStore source code](https://github.com/fluxmodels/fluxmodels/tree/main/packages/core/src/StateStore.ts).

&nbsp;

### Event Handling with EventsManager

The EventsManager is a powerful class designed to manage events within your models, providing a streamlined approach to event handling and observation.

EventsManager supports five primary events:

1. **Init**: Triggered when a state is initialized.
2. **Change**: Fired when a state undergoes modification.
3. **Error**: Occurs when validation or serialization encounters an error.
4. **Mount**: Activated when a state proxy is mounted (e.g., when `useModel` is called in React).
5. **Unmount**: Triggered when a state proxy is unmounted (e.g., when a React component is destroyed).

Also there are same named decorators / functions, that helps to add events handlers.

OnChange:

```ts
import { OnChange } from '@fluxmodels/core'
// or import { OnChange } from '@fluxmodels/react'

class Model {
    @OnChange()
    changeHandler(args: {
        state: this
        propName: string | symbol
        prevValue: any
        newValue: any
    }) {
        // will be called when states changes
        console.log(args)
    }
}
```

OnError:

```ts
import { OnError } from '@fluxmodels/core' 
// or import { OnError } from '@fluxmodels/react'

class Model {
    @OnError()
    errorHandler(args: {
        state: any
        error: Error
        errorPlace: MetaErrorHandlerPlaceType 
        // 'get' | 'set' | 'define' | 'delete' | 'validate' | 'deserialize' | 'serialize'
    }) {
        // will be called when an error occurs 
        // while states are being changed (validation or serialization errors)
        console.log(args)
    }
}
```

OnInit:

```ts
import { OnInit } from '@fluxmodels/core'
// or import { OnInit } from '@fluxmodels/react'

class Model {
    @OnInit()
    onInit(state: this) {
        // will be called when state is initialized, e.g. when useModel is called first time
        console.log(args)
    }
}
```

OnMount / OnUnmount:

```ts
import { OnMount, OnUnmount } from '@fluxmodels/core'
// or import { OnMount, OnUnmount } from '@fluxmodels/react'

class Model {
    @OnMount()
    onMount(state: this) {
        // will be called when state is mounted, e.g. React component is mounted
        console.log(args)
    }

    @OnUnmount()
    onUnmount(state: this) {
        // will be called when state is unmounted, e.g. React component is unmounted
        console.log(args)
    }
}
```

&nbsp;

### Utils and Tools

#### UseLoader

There is special decorator `@UseLoader` that helps to handle start and end of the async actions in your models.

Example:

```ts
import { UseLoader } from '@fluxmodels/core'
// or import { UseLoader } from '@fluxmodels/react'

class MyModel {
    isLoading = false

    @UseLoader((isLoading, state) => {
        state.isLoading = isLoading
    })
    async load1() {
        // DO something
    }

        
    // or 

    setLoading(isLoading: boolean, state: this) {
        this.isLoading = isLoading
    }

    @UseLoader('setLoading')
    async load2() {
        // DO something
    }
}

```

&nbsp;

### Runtime Validation/Serialization

Models in FluxModels are closely integrated with [Metatyper](https://www.npmjs.com/package/metatyper), a powerful library that enhances state management capabilities. This integration offers several key benefits:

1. Declarative and Reactive State Management: Leveraging Metatyper's functionality, FluxModels enables developers to manage and observe state in a clear, declarative, and reactive manner.

2. Automatic Validation and Serialization: Metatyper handles data validation and serialization tasks, reducing the burden on developers and ensuring data integrity.

3. Native-like State Description: Developers can define their state structure and interactions at a high level, abstracting away low-level implementation details.

This synergy between FluxModels and Metatyper allows for a more intuitive and efficient approach to state management, combining the best of both libraries to create robust and maintainable applications.

Example (React):

```ts
import { STRING } from 'metatyper'

class MyModel {
    id = 0
    username = STRING({ maxLength: 3, default: '' })

    updateUsername(newUsername) {
        this.username = newUsername 
        // throws ValidationError if newUsername.length > 3 or newUsername not string
    }
}

// -------------------------------------------

const [state, updateState] = useModel(MyModel)

updateState({ id: "some id" }) // will throw ValidationError, because id must be number
state.updateUsername('1234') // will throw ValidationError, because maxLength is 3
```

> `ValidationError` or `SerializationError` are part of the Metatyper functionality
> For more information on this, visit [https://docs.metatyper.dev](https://docs.metatyper.dev).

&nbsp;

# Similar Libraries

- [MobX](https://mobx.js.org/): Reactive state management with observables and classes. MobX uses a more object-oriented approach, allowing for easy integration of existing codebases.

- [Redux](https://redux.js.org/): Centralizes application state and logic. Redux follows a strict unidirectional data flow and is known for its predictability and powerful developer tools.

- [Valtio](https://valtio.pmnd.rs/): Proxy-based state management for React and Vanilla. Valtio offers a simple API and efficient updates, making it easy to adopt in both small and large projects.

- [Recoil](https://recoiljs.org/): An experimental state management library for React applications. Recoil introduces a unique atom-based approach to managing state, offering fine-grained updates and derived state.

- [Jotai](https://jotai.org/): Atomic state management for React. Jotai provides a minimalistic approach to state management, focusing on composability and flexibility.

- [Zustand](https://zustand-demo.pmnd.rs/): A small, fast, and scalable state management solution. Zustand is known for its simplicity and ease of use, especially in React applications.

- [Zod](https://zod.dev/): A TypeScript-first schema declaration and validation library. It offers a concise API for defining complex data structures and ensures type safety at runtime.

- [Yup](https://github.com/jquense/yup): A JavaScript schema builder for value parsing and validation. It provides an intuitive, chainable interface for creating validation schemas.

- [Joi](https://joi.dev/): A powerful schema description language and data validator for JavaScript. It supports an extensive set of validation rules and is highly customizable.

These libraries each have their own strengths and use cases, catering to different project needs and developer preferences.

While these libraries offer various state management and validation solutions,

FluxModels stands out by combining state management and data validation into a single, cohesive solution. It seamlessly integrates with both React and non-React environments, providing a unified approach to handling application state and ensuring data integrity.

By merging these two crucial aspects of application development, FluxModels simplifies the development process and reduces the need for multiple libraries. It offers advanced features like runtime validation/serialization, injected models, and a robust event management system, making it an excellent choice for modern application development where both state management and data validation are paramount.

&nbsp;

# Change Log

Stay updated with the latest changes and improvements: [GitHub Releases](https://github.com/fluxmodels/fluxmodels/releases).
