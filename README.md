<div align="center" class="cover">

[![FluxModels](https://raw.githubusercontent.com/fluxmodels/fluxmodels/main/docs/images/cover.png)](https://docs.fluxmodels.dev/)

type-safe state management

---

[![website](https://img.shields.io/badge/Docs-fluxmodels.dev-2ea845?style=flat&labelColor=202020)](https://docs.fluxmodels.dev/) [![metatyper website](https://img.shields.io/badge/Docs-metatyper.dev-2ea845?style=flat&labelColor=202020)](https://metatyper.dev/) [![license: MIT](https://img.shields.io/badge/License-MIT-00aa00.svg?style=flat&labelColor=202020)](https://opensource.org/licenses/MIT) [![Tests](https://img.shields.io/github/actions/workflow/status/fluxmodels/fluxmodels/test.yaml?style=flat&labelColor=202020&label=Tests)](https://github.com/fluxmodels/fluxmodels/actions/workflows/test.yaml)  [![donate](https://img.shields.io/badge/Donate-PayPal-ff3f59.svg?style=flat&labelColor=202020)](https://paypal.me/vadzimsharai)

</div>

&nbsp;

# Introduction

FluxModels is a modern TypeScript-first state management library created for one simple reason: **too much boilerplate code**. The aim is to separate data from rendering logic and to let developers use JavaScript besides TypeScript in a natural way - without extra abstractions or the need to learn another paradigm.

## Why FluxModels exists

Modern state tools often force developers to
- Write repetitive code
- Learn framework-specific patterns that feel foreign to vanilla JS/TS
- Blur the lines between your data layer and UI layer

FluxModels rests on a simple idea - you write ordinary TypeScript. You use classes, methods and plain objects. The library still gives you reactivity, validation and all the other benefits of modern Front-end libraries.

## What FluxModels delivers

- ✨ **Minimal boilerplate**: declare your data schemas once and wire them everywhere without repetitive glue code.
- 🧩 **Familiar TS/JS ergonomics**: interact with plain objects, classes, and methods so state code reads like idiomatic TypeScript.
- 🛡️ **Type-safe**: TypeScript typings plus automatic `runtime validation` keep every state consistent.
- 🚀 **Granular performance tuning**: intelligent diffing and selective updates prevent unnecessary renders.
- 🔄 **First-class async support**: orchestrate effects, background tasks, and streaming updates without extra layers.
- 🎯 **Clear separation of concerns**: keep your data logic separate from your rendering logic, making both easier to reason about and test.
- 💉 **Built-in dependency injection**: seamlessly connect related states without complex DI frameworks, manual wiring, or learning unfamiliar paradigms.

FluxModels is more than a store - it is a cohesive state platform that keeps codebases clean, predictable and ready for the next feature, while letting JavaScript or TypeScript work as intended.

&nbsp;

# Table of Contents
- [Introduction](#introduction)
  - [Why FluxModels exists](#why-fluxmodels-exists)
  - [What FluxModels delivers](#what-fluxmodels-delivers)
- [Table of Contents](#table-of-contents)
- [Packages](#packages)
- [Installation](#installation)
  - [TypeScript configuration](#typescript-configuration)
- [Basic Usage](#basic-usage)
  - [Simple Example](#simple-example)
  - [Injected States Example](#injected-states-example)
- [Examples And Guides](#examples-and-guides)
- [Documentation](#documentation)
  - [React](#react)
    - [useModel](#usemodel)
    - [Suspense](#suspense)
      - [UseSuspense](#usesuspense)
      - [Lifecycle integration](#lifecycle-integration)
      - [StateSuspense component](#statesuspense-component)
    - [StateStore Provider](#statestore-provider)
  - [Core](#core)
    - [Model](#model)
    - [State and StateManager](#state-and-statemanager)
      - [State essentials](#state-essentials)
      - [StateManager responsibilities](#statemanager-responsibilities)
    - [StateProxy and StateProxyManager](#stateproxy-and-stateproxymanager)
      - [Lifecycle](#lifecycle)
      - [Observable Properties](#observable-properties)
        - [Declaring observables explicitly](#declaring-observables-explicitly)
        - [Auto-resolving observables](#auto-resolving-observables)
    - [Inject States (InjectModel)](#inject-states-injectmodel)
      - [What you can inject](#what-you-can-inject)
      - [`InjectModel` Arguments](#injectmodel-arguments)
      - [`InjectModel` Examples](#injectmodel-examples)
    - [StateStore](#statestore)
    - [Event Handling with EventsManager](#event-handling-with-eventsmanager)
    - [Runtime Validation and Serialization](#runtime-validation-and-serialization)
      - [Validation](#validation)
      - [Serialization and Coercion](#serialization-and-coercion)
    - [State Errors Handling](#state-errors-handling)
    - [Utils](#utils)
- [API Reference](#api-reference)
- [Similar Libraries](#similar-libraries)
- [Change Log](#change-log)

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

For non-React projects:

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

# Basic Usage

## Simple Example

[![Open in CodeSandbox](https://img.shields.io/badge/Open_in-CodeSandbox-eaff96?logo=codesandbox&logoColor=white)](https://codesandbox.io/s/fluxmodel-react-basic-usage-example-1-hpf55z?fontsize=14&hidenavigation=1&theme=dark)

```tsx
import { useModel, STRING, PASSWORD, OnError } from '@fluxmodels/react'

class UserModel {
    username = STRING({ default: "", maxLength: 12 })
    password = PASSWORD({ default: "", safe: false })  
    // safe=false: allows state updates even when validation fails (useful for form inputs)

    randomField = 'any string'

    updatePassword(password) {
        this.password = password
    }

    @OnError()
    onError({ error }){
        // you can handle validation errors here
        console.error(error)
    }
}


function Example() {
    const [user, updateUser] = useModel(UserModel)

    const onChangeUsername = (username) => {
        // state can be updated using the update function (works like useState in React)

        try{
            updateUser({ username })
        }catch(e){
            // you can also handle the error here
        }
    }

    const onChangePassword = (password) => {
        // state can be updated using model methods as well

        // No try-catch needed: password field has safe=false, 
        // so it won't throw errors
        user.updatePassword(password)
    }

    const changeWithoutRerender = () => {
        // This will update the state, but won't trigger a re-render of this component
        // because randomField is not an observable property.
        // Properties become observable only when they are accessed in the component
        // or explicitly provided in the useModel hook
    
        updateUser({ randomField: 'new value' })
    }

    const changeWithError = () => {
        // This will throw a validation error because randomField expects a string,
        // but we're trying to update it with a number value

        try{
            updateUser({ randomField: 123 })
        }catch(e){
            console.error(e)
        }
    }

    return <>
        <input
            value={user.username}
            onChange={(e) => onChangeUsername(e.target.value)}
        />
        
        <input
            type='password'
            value={user.password}
            onChange={(e) => onChangePassword(e.target.value)}
        />
        
        <button onClick={changeWithoutRerender}>
            Update without rerender
        </button>
        
        <button onClick={changeWithError}>
            Update with error
        </button>
    </>
}

export default function App() {
    return <Example />
}
```

&nbsp;

## Injected States Example

[![Open in CodeSandbox](https://img.shields.io/badge/Open_in-CodeSandbox-eaff96?logo=codesandbox&logoColor=white)](https://codesandbox.io/s/fluxmodel-react-basic-usage-example-2-dr5c7w?fontsize=14&hidenavigation=1&theme=dark)


```tsx
import React from 'react'
import {
    useModel,
    InjectModel,
    KEY,
    STRING,
    ValidationError,
    type StateSnapshot,
} from '@fluxmodels/react'

// ==================================================================================================
// ============================================= Models =============================================
// ==================================================================================================

class TodoItemState {
    id = KEY()
    text = STRING()
    completed = false

    projectState = InjectModel(ProjectState)

    toggle() {
        this.completed = !this.completed
    }

    remove() {
        this.projectState.removeTodo(this.id)
    }
}

class ProjectState {
    todoList = InjectModel([TodoItemState], {
        // The 'id' field is used as a key for state management
        // When assigning, the value of this field is used as a key to find the state in the store
        keyResolver: 'id'
    })

    get completedCount() {
        return this.todoList.filter((todo) => todo.completed).length
    }

    addTodo(text: string) {
        const newTodo = {
            id: Math.random().toString(36).substring(2, 15),
            text
        } as TodoItemState

        this.todoList = [
            ...this.todoList,
            newTodo
        ]
    }

    removeTodo(id: string) {
        this.todoList = this.todoList.filter((todo) => todo.id !== id)
    }
}

const TodoAddUIState = {
    error: '',
    todoName: STRING({ default: '', trim: true, maxLength: 16 }),

    projectState: InjectModel(ProjectState),

    handleTodoNameChange(todoName: string) {
        this.error = ''

        try {
            this.todoName = todoName
        } catch (error) {
            if (error instanceof ValidationError) {
                this.error = error.issues.map((issue) => {
                    switch (issue.code) {
                        case 'MaxLength':
                            return `Name must be at most ${issue.validator.context?.maxLength} characters long`
                        default:
                            return issue.message
                    }
                }).join(', ')
            } else {
                throw error
            }
        }
    },

    handleTodoAdd() {
        if (this.todoName) {
            this.projectState.addTodo(this.todoName)
            this.handleTodoNameChange('')
        }
    }
}

// ==================================================================================================
// =========================================== Components ===========================================
// ==================================================================================================

function TodoAddComponent() {
    const [{ todoName, error, handleTodoNameChange, handleTodoAdd }] = useModel(TodoAddUIState)

    return (
        <>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    value={todoName}
                    onChange={(e) => handleTodoNameChange(e.target.value)}
                    placeholder={`Add a new todo...`}
                    style={{ flex: 1, padding: '8px' }}
                />
                <button onClick={handleTodoAdd} style={{ padding: '8px 16px' }}>Add</button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        </>
    )
}

function TodoItemComponent({ todoItemState }: { todoItemState: StateSnapshot<TodoItemState> }) {
    // Alternative: pass todoItemId as prop and retrieve state with useModel
    // const [todoItemState] = useModel(TodoItemState, { key: todoItemId })

    return (
        <div key={todoItemState.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', width: '100%' }}>
                <input
                    type="checkbox"
                    checked={todoItemState.completed}
                    onChange={() => todoItemState.toggle()}
                />
                <span style={{ textDecoration: todoItemState.completed ? 'line-through' : 'none' }}>
                    {todoItemState.text}
                </span>
            </div>

            <button onClick={() => todoItemState.remove()} style={{ padding: '4px 8px' }}>
                Delete
            </button>
        </div>
    )
}

function TodoListComponent() {
    const [projectState] = useModel(ProjectState)

    return (
        <div style={{ marginBottom: '20px' }}>
            {projectState.todoList.map((todoItemState) => (
                <TodoItemComponent key={todoItemState.id} todoItemState={todoItemState} />
            ))}
        </div>
    )
}

function TodoStatsComponent() {
    const [projectState] = useModel(ProjectState)

    return (
        <div style={{ marginTop: '20px', padding: '10px' }}>
            Total: {projectState.todoList.length} |
            Completed: {projectState.completedCount}
        </div>
    )
}

export default function App() {
    return (
        <div style={{ padding: '20px', margin: '0 auto', maxWidth: '384px' }}>
            <h1>TODO List</h1>

            <TodoAddComponent />
            <TodoListComponent />
            <TodoStatsComponent />
        </div>
    )
}
```

&nbsp;

# Examples And Guides

- [Simple usage in React](https://codesandbox.io/s/fluxmodel-react-basic-usage-example-1-hpf55z?fontsize=14&hidenavigation=1&theme=dark) - just first example from the docs.
- [Injected states](https://codesandbox.io/s/fluxmodel-react-basic-usage-example-2-dr5c7w?fontsize=14&hidenavigation=1&theme=dark) - the second example from the docs, shows how to combine states, use array of states, inject these states like DI.
- [Form example](https://codesandbox.io/p/sandbox/fluxmodel-react-form-example-2vftzg?fontsize=14&hidenavigation=1&theme=dark) - More complex example showing the most popular state management use case: form handling with validation, async submission, and error states.
- [Content router example](https://codesandbox.io/p/sandbox/fluxmodels-react-complex-examples-nr295w) - another one complex example.

&nbsp;

# Documentation

## React

React package contains the React hooks and tools for FluxModels.

### useModel

`useModel` binds a FluxModels state to a React component so the component re-renders whenever the model updates. It gives you a safe, read-only view of the current state together with an imperative helper for making updates from the component.

Signature: [`useModel`](docs/api/react/src/functions/useModel.md)

`const [stateSnapshot, updateState] = useModel(StateModel, args?)`

- `stateSnapshot` is a frozen snapshot that exposes all model fields and actions. Mutating actions (methods defined on the model) automatically schedule re-renders.
- `updateState` applies partial updates or accepts an updater function, similar to React's `setState`.

Typical usage:

```tsx
const UserModel = {
    username: '',
    updateUsername(newUsername) {
        this.username = newUsername
    }
}

function ProfileHeader() {
    const [user, updateUser] = useModel(UserModel)

    return (
        <div>
            <p>Signed in as {user.username}</p>
            <button onClick={() => updateUser({ username: 'Felix' })}>
                Rename via updater
            </button>
            <button onClick={() => user.updateUsername('Felix')}>
                Rename via action
            </button>
        </div>
    )
}
```


&nbsp;

### Suspense

FluxModels ships with first-class integration for React Suspense. Decorate (or wrap) asynchronous model actions with `UseSuspense` so that any promise they return automatically activates the nearest Suspense boundary, displays fallback UI, and re-renders when the promise settles.

#### UseSuspense

Signature: [`UseSuspense`](docs/api/react/src/functions/UseSuspense.md)

- `UseSuspense(fn, args?)` wraps a function and returns a Suspense-aware version.
- `UseSuspense(args?)` returns a decorator for class methods.

```tsx
class UserModel {
    username = ''

    @UseSuspense()
    async loadProfile() {
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.username = 'Felix'
    }
}

function ProfileCard() {
    const [user] = useModel(UserModel)

    return (
        <section>
            <strong>{user.username ?? 'Anonymous'}</strong>
            <button onClick={() => user.loadProfile()}>
                Load profile
            </button>
        </section>
    )
}

function App() {
    return (
        <Suspense fallback={<p>Loading profile…</p>}>
            <ProfileCard />
        </Suspense>
    )
}
```


#### Lifecycle integration

Combine `UseSuspense` with lifecycle helpers such as [`OnInit`](#event-handling-with-eventsmanager) to suspend on initial render, or attach it to lazy-loading actions invoked from event handlers. FluxModels batches rerenders and manages pending promises, so any component consuming the state observes consistent loading states.

```tsx
class MyModel {
    ready = false

    @OnInit()
    @UseSuspense()
    async bootstrap() {
        await new Promise(resolve => setTimeout(resolve, 1200))
        this.ready = true
    }
}
```

#### StateSuspense component

`StateSuspense` is a thin layer on top of React `Suspense`. Hand it any state proxy and it will check whether that proxy (or its injected children) has pending promises registered via `UseSuspense`. If it finds one, it throws the promise for you, so the nearest Suspense boundary shows the fallback automatically.

Signature: [`StateSuspense`](docs/api/react/src/functions/StateSuspense.md)

- `state`: state proxy.
- `fallback`: Suspense fallback to render while promises are pending.

This removes the need for manual Suspense wrappers whose only job is to call `useModel` and rethrow pending promises:

```tsx

function List() {
    const [state] = useModel(ListModel)

    return state.items.map(itemState => (
        // Handles UseSuspense promises from itemState
        <StateSuspense key={itemState.id} state={itemState} fallback={<p>Loading…</p>}>
            ...
        </StateSuspense>
    ))
}
```

Without StateSuspense you may write:

```tsx
function Item({ id }) {
    const [itemState] = useModel(ItemModel, { key: id }) // handles UseSuspense promises from the state

    return <>...</>
}

function List() {
    const [state] = useModel(ListModel)

    return state.items.map(item => (
        <Suspense key={item.id} fallback={<p>Loading…</p>}>
            <Item id={item.id} />
        </Suspense>
    ))
}

```


`StateSuspense` inspects `itemState`, detects promises created by `UseSuspense`, and triggers the Suspense fallback without any extra glue component.

&nbsp;

### StateStore Provider

`StateStoreProvider` scopes a `StateStore` instance to a portion of your React tree. Providers can be nested and behave like React Context—descendants receive the nearest store, while components outside any provider fall back to the global default store created by FluxModels.

Signature: [`StateStoreProvider`](docs/api/react/src/functions/StateStoreProvider.md) · [`useStateStore`](docs/api/react/src/functions/useStateStore.md) · [`StateStore`](docs/api/core/src/classes/StateStore.md)

> For more details about `StateStore`, see the [StateStore section](#statestore).

When to provide a custom store:

- Isolate feature areas so their models do not pollute the global store.
- Preload or hydrate a bundle of models before rendering a subtree.
- Run multiple copies of the same models with independent state (multi-tenant dashboards, split testing, etc.).

You can create and export a store once, then reuse it wherever needed:

```ts
// store.ts
import { StateStore } from '@fluxmodels/core'

export const sharedStore = new StateStore()
```

Accessing the active store:

Use `useStateStore()` when you need the store object itself—for example, to spawn models imperatively, inspect registered states, or tap into testing helpers.

```tsx
import { useStateStore } from '@fluxmodels/react'

function Component() {
    const store = useStateStore() // store from StateStoreProvider or default

    console.log(store)

    return <>...</>
}
```

Example:

```tsx
import { StateStoreProvider, useModel } from '@fluxmodels/react'
import { StateStore } from '@fluxmodels/core'

function UserCard() {
    const [user] = useModel(UserModel)
    return <div>User: {user.username}</div>
}

const sharedStore = new StateStore()

function App() {
    return (
        <>
            {/* Uses the global default store */}
            <UserCard />

            {/* Uses a dedicated store for this subtree */}
            <StateStoreProvider store={sharedStore}>
                <UserCard />
            </StateStoreProvider>
        </>
    )
}
```

Inside the provider, every `useModel` call reads from `sharedStore`, while the top-level `UserCard` continues to rely on the default store.

&nbsp;

## Core

Core package contains the core functionality of FluxModels. It is a standalone library that can be used without React.

### Model

A model is the schema for a FluxModels state. It can be a class or a plain object whose fields describe reactive data and whose methods encapsulate business logic. Models frequently use [Metatyper](https://github.com/metatyper/metatyper) types to declare validation rules, defaults, and serialization behaviour, and they can inject other states via [metatypes](#inject-states-injectmodel).

Signature: [`StateModel`](docs/api/core/src/type-aliases/StateModel.md)

- Classes provide methods and lifecycle decorators; FluxModels instantiates them when the state is created.
- Plain objects are cloned into state instances and can still host decorators or metatypes.
- Decorators such as [`OnInit`](docs/api/core/src/variables/OnInit.md) or [`OnChange`](docs/api/core/src/variables/OnChange.md) attach behaviour regardless of using classes or objects.

```ts
import { StateManager, NUMBER, STRING } from '@fluxmodels/core'

class UserModel {
    id = NUMBER({ min: 0, optional: true })
    username = STRING({ maxLength: 12, default: '' })

    updateUsername(name: string) {
        this.username = name
    }
}

const [user] = StateManager.getOrCreateState(UserModel, { key: 'user:1' })
user.updateUsername('Felix') // validated by Metatyper lib
```

> Any class or object becomes a model once you pass it to `StateManager.getOrCreateState`. The instance is then tracked, validated, and eligible for injection into other states.

&nbsp;

### State and StateManager

A **state** is a live instance of a model. It is produced by the `StateManager`, validated by Metatyper, and enriched with lifecycle hooks and metadata.

Signature: [`State`](docs/api/core/src/type-aliases/State.md) · [`StateManager`](docs/api/core/src/classes/StateManager.md) · [`StateArgs`](docs/api/core/src/type-aliases/StateArgs.md)

#### State essentials

- The first call to `StateManager.getOrCreateState(model, { key, store })` creates the instance, places it in the specified [`StateStore`](#statestore) (or the default store if none is provided), and wires Metatyper validation.
- Every state carries metadata (model, key, store) via [`StateManager.instance(state)`](docs/api/core/src/classes/StateManager.md#instance) and the [`KEY`/`STORE`/`MODEL`](#utils) metatypes.
- Lifecycle handlers declared with decorators such as [`@OnInit`](docs/api/core/src/variables/OnInit.md) or [`@OnChange`](docs/api/core/src/variables/OnChange.md) run automatically when the state is initialised or mutated.

#### StateManager responsibilities
- [`StateManager.getOrCreateState`](docs/api/core/src/classes/StateManager.md#getorcreatestate) reuses existing instances by key and store, guaranteeing referential stability across repeated lookups. It also registers newly created states in the store for centralized management.
- [`instance`](docs/api/core/src/classes/StateManager.md#instance) exposes the manager for an existing state.
- [`waitForInit`](docs/api/core/src/classes/StateManager.md#waitforinit) awaits every asynchronous `@OnInit` handler in the state tree, recursing through injected states.
- [`upsertStates`](docs/api/core/src/classes/StateManager.md#upsertstates) bulk creates or updates many keyed states in one call.
- [`removeState`](docs/api/core/src/classes/StateManager.md#removestate) removes a state from its store, allowing explicit teardown.

```ts
const [project, isNew] = StateManager.getOrCreateState(ProjectModel, {
    key: 'project:42',
    assignObject: { name: 'Draft' }
})

if (isNew) {
    await StateManager.waitForInit(project) // waits for async @OnInit handlers
}

project.name = 'Published' // triggers validation + @OnChange listeners
```

> If you ever need to introspect a state, call `StateManager.instance(state)`—it returns the manager that knows about mounted proxies, events, store, and other meta information.

&nbsp;

### StateProxy and StateProxyManager

State proxies are thin wrappers around states that add reactivity, lifecycle management, and safe read-only snapshots. They are what React components receive from `useModel`.

Signature: [`StateProxy`](docs/api/core/src/type-aliases/StateProxy.md) · [`StateProxyManager`](docs/api/core/src/classes/StateProxyManager.md) · [`StateProxyArgs`](docs/api/core/src/type-aliases/StateProxyArgs.md)


#### Lifecycle

- [`StateProxyManager.getOrCreateStateProxy`](docs/api/core/src/classes/StateProxyManager.md#getorcratestateproxy)`(state, { observeProps, autoResolveObservableProps })` creates the proxy and prepares observation rules.
- [`mount`](docs/api/core/src/classes/StateProxyManager.md#mount)`(handler, context)` subscribes to observable changes, emits [`@OnMount`](docs/api/core/src/variables/OnMount.md), and registers the proxy as "mounted".
- [`refresh`](docs/api/core/src/classes/StateProxyManager.md#refresh)`()` updates the entire proxy tree if the underlying state has changed, rebuilds metadata, and mounts/unmounts injected states that were added or removed. This method should be called during every render or before using the state to ensure the proxy reflects the current state. This guarantees that all lifecycle updates happen at render time.
- [`unmount`](docs/api/core/src/classes/StateProxyManager.md#unmount)`()` unsubscribes, emits [`@OnUnmount`](docs/api/core/src/variables/OnUnmount.md), and recursively unmounts injected proxies.
- [`createSnapshot()`](docs/api/core/src/classes/StateProxyManager.md#createsnapshot) deep-freezes the proxy while preserving method bindings and prototype chains. React hooks like `useModel` call it to expose read-only views of the state without leaking mutability:
    ```ts
    const [proxy] = StateProxyManager.getOrCreateStateProxy(state)
    const manager = StateProxyManager.instance(proxy)

    manager.mount(({ propName }) => console.log(`${propName} changed`))

    const snapshot = manager.createSnapshot()
    console.log(snapshot.name) // safe read, immutable object
    ```

#### Observable Properties

Observable properties let FluxModels know which parts of a state should trigger reactivity. Only observed keys re-run change handlers and re-render components, keeping large models fast.

- [`observeProps`](docs/api/core/src/type-aliases/StateProxyArgs.md) can be a boolean, array, record, or nested record that describes which properties (and injected states) should trigger change handlers.
- When [`autoResolveObservableProps`](docs/api/core/src/type-aliases/StateProxyArgs.md) is `true`, the manager marks properties as observable the first time they are accessed.
- Only observed keys call the mounted change handler, improving rendering performance when large models are used.

##### Declaring observables explicitly

Pass an `observeProps` structure when you create a proxy (e.g., via `useModel`):

```tsx
import { InjectModel } from '@fluxmodels/core'
import { useModel } from '@fluxmodels/react'

class ProfileModel {
    fullName = ''
}

class UserModel {
    username = ''
    passwordHash = ''

    profileKey?: string
    profile = InjectModel(ProfileModel)
}

function UserCard() {
    const [user] = useModel(UserModel, {
        observeProps: {
            username: true,
            passwordHash: false, // never trigger renders
            profile: { fullName: true } // nested observables
        }
    })

    return <p>{user.username}</p>
}
```

- A boolean marks direct fields (`true` observe, `false` ignore).
- Nested objects (or arrays such as `profile: { fullName: true }`) describe injected state fields.
- Injected states use two observable properties: one for the reference itself (e.g., `profileKey`) and one for the injected state's data (e.g., `profile`). Observing `profileKey` tracks when the reference changes; observing `profile` tracks changes inside `ProfileModel`.

##### Auto-resolving observables

When `autoResolveObservableProps` is enabled (default), reading a property on the proxy automatically registers it as observable the first time. You can mix both approaches: provide `observeProps` for guardrails and rely on auto-resolution for occasional reads.

```ts
const [userState] = StateManager.getOrCreateState(UserModel)
const [userProxy] = StateProxyManager.getOrCreateStateProxy(userState)

const userProxyManager = StateProxyManager.instance(userProxy)

userProxyManager.mount(() => {
    console.log('re-render')
})

// writes before access do not trigger reactions
userProxy.username = '...'

console.log(userProxy.username) // first tracked access

// now this write triggers the mounted callback
userProxy.username = 'new one'
```

React example:

```ts
const [user, updateUser] = useModel(UserModel)

// -------------------------------------------

const clickHandler = () => {
    // untracked prop, so this write skips re-rendering
    updateUser({ username: '...' })
}

return <button onClick={clickHandler}></button>

// -------------------------------------------

const clickHandler = () => {
    // once the property is read, future writes re-render
    updateUser({ username: '...' })
}

const username = user.username // tracked access

return <>
    Username: {username}
    <button onClick={clickHandler}></button>
</>
```

> Observables apply recursively. When you observe an injected state, FluxModels forwards the configuration to its proxy so nested reads remain reactive without manual wiring.

&nbsp;

### Inject States (InjectModel)

`InjectModel` turns a property into a lazily-resolved reference to another state. On every read it calls `StateManager.getOrCreateState`, reusing existing instances by key and store, and returns either the state or a cached proxy (when accessed from a proxy).

Signature: [`InjectModel`](docs/api/core/src/functions/InjectModel.md) · [`INJECT_KEY`](docs/api/core/src/variables/INJECT_KEY.md) · [`INJECT_STORE`](docs/api/core/src/variables/INJECT_STORE.md)

#### What you can inject

- **A single model**: `InjectModel(UserModel)` — resolves to one state instance.
- **A collection**: `InjectModel([UserModel])` — returns a frozen array of state instances.
- **Dynamic models**: `InjectModel((state, key) => pickModel(state, key))` — choose the model at runtime based on parent state or key.

#### `InjectModel` Arguments

Signature: [`InjectModelArgs`](docs/api/core/src/type-aliases/InjectModelArgs.md)

- `keyFrom` (default `${propName}Key`): specifies which property on the `parent state` holds the key for the injected state. By default, FluxModels looks for a property named `${propName}Key` (e.g., if the injected property is `account`, it reads from `accountKey`). Use the special constant `INJECT_KEY` to make the injected state share the same key as its parent state.
- `keyResolver`: specifies which property on the `injected state` holds the key. When `keyResolver` is provided, the `InjectModel` field becomes **writable**, allowing you to assign a new state instance directly. The key for the assigned state will be extracted using `keyResolver`. It can be either:
  - A string (property name on the injected state, e.g., `'id'`).
  - A function `(value) => key` that receives the assigned value and returns its key.

  By default, `keyResolver` is `undefined` and the `InjectModel` field is **read-only**.
- `store` (default `INJECT_STORE`): explicit store instance or `INJECT_STORE` to inherit the parent store. By default, the injected state uses the same store as its parent state.
- `optional`: allow `undefined` keys and models. When the key is `undefined` or the model is `undefined`, the injected property returns `undefined` instead of throwing an error. For array injections, individual elements with `undefined` keys will also be `undefined`.
- `nullable`: allow `null` keys and models. When the key is `null` or the model is `null`, the injected property returns `null` instead of throwing an error. For array injections, individual elements with `null` keys will also be `null`.
- `observeProps`: nested observable configuration forwarded to injected proxies.
- `autoResolveObservableProps` (default `true`): auto-mark injected fields as observed when accessed.

Keys are validated aggressively: unless the matching flag is enabled, `undefined` and `null` keys throw. For array injections the checks run per element and the resulting array is frozen.

#### `InjectModel` Examples

Simple state injection:

```ts
import { InjectModel, KEY, STRING, StateManager, OnInit } from '@fluxmodels/core'

class Account {
    id = KEY()
    displayName = STRING({ default: '' })

    @OnInit()
    onInit() {
        this.displayName = `Acc-${this.id}`
    }
}

class Project {
    ownerId?: string
    owner = InjectModel(Account, { keyFrom: 'ownerId', optional: true })
}

const [project] = StateManager.getOrCreateState(Project)
project.owner // undefined because optional=true and no key yet
project.ownerId = 'acc-1'
project.owner?.displayName // lazily resolved
```

Array of states:

```ts
import { InjectModel, KEY, STRING, StateManager } from '@fluxmodels/core'

class Account {
    id = KEY()
    displayName = STRING({ default: '' })

    friendIds: string[] = []
    friends = InjectModel([Account], { keyFrom: 'friendIds', keyResolver: 'id' })
}

const [myAcc] = StateManager.getOrCreateState(Account)

myAcc.friends = [
    {
        id: 'friendId1', // used as key
        displayName: 'Friend 1'
    } as Account // creates a new state (and inject it)
]

const [friend1] = StateManager.getOrCreateState(Account, { key: 'friendId1' })

console.log(friend1 === myAcc.friends[0]) // true
console.log(myAcc.friendIds) // ['friendId1']

myAcc.friends = [
    ...myAcc.friends,

    {
        id: 'friendId2', // used as key
        displayName: 'Friend 2'
    } as Account // creates a new state (and inject it)
]

const [friend2] = StateManager.getOrCreateState(Account, { key: 'friendId2' })

console.log(friend1 === myAcc.friends[0]) // true
console.log(friend2 === myAcc.friends[1]) // true
console.log(myAcc.friendIds) // ['friendId1', 'friendId2']

myAcc.friendIds = ['friendId2']

console.log(myAcc.friends) // prints only Friend 2
```

Dynamic model selection with store forwarding:

```ts
import { InjectModel, STRING } from '@fluxmodels/core'

class ProjectModel {
    ownerType: 'team' | 'user' = 'user'

    ownerId = STRING({ optional: true })

    owner = InjectModel(
        (state) => (state.ownerType === 'team' ? TeamModel : UserModel),
        { keyFrom: 'ownerId', optional: true }
    )
}
```

React collections:

```tsx
function TeamList() {
    const [myAcc] = useModel(Account)

    return (
        <ul>
            {myAcc.friends.map((friend) => (
                <li key={friend.id}>{friend.displayName}</li>
            ))}
        </ul>
    )
}
```

&nbsp;

### StateStore

`StateStore` is the in-memory registry that keeps every state grouped by model and key. `StateManager` writes to it automatically, but you can create and pass custom stores to isolate domains or implement your own persistence layer.

Signature: [`StateStore`](docs/api/core/src/classes/StateStore.md)

- `StateStore.defaultStore` lazily creates a singleton shared across the process.
- `findState(model, key)` and `findStates(model, predicate?)` let you locate states.
- `getKeys(model)` exposes all keys currently stored for a model.
- `addState`, `removeState`, and `clearStore` support manual management when integrating with frameworks or tests.

```ts
import { StateManager, StateStore } from '@fluxmodels/core'

const sharedStore = new StateStore()

StateManager.getOrCreateState(UserModel, { key: 'u1', store: sharedStore })

const found = sharedStore.findState(UserModel, 'u1')
console.log(found?.username)

sharedStore.removeState(UserModel, 'u1')
```

> You can extend `StateStore` to persist to IndexedDB, LocalStorage,
> or any other methods while keeping the same interface.
> Every FluxModels API accepts a store instance through `StateArgs.store`.


&nbsp;

### Event Handling with EventsManager

`EventsManager` orchestrates lifecycle hooks for states and proxies.
Every state has its own manager, and decorators register handlers that fire when the relevant lifecycle stage is reached.

Signature: [`EventsManager`](docs/api/core/src/classes/EventsManager.md) · [`OnInit`](docs/api/core/src/variables/OnInit.md) · [`OnChange`](docs/api/core/src/variables/OnChange.md) · [`OnError`](docs/api/core/src/variables/OnError.md) · [`OnMount`](docs/api/core/src/variables/OnMount.md) · [`OnUnmount`](docs/api/core/src/variables/OnUnmount.md)

- `Init` — runs after `StateManager` creates a state (async handlers are awaited by `waitForInit`).
- `Change` — fires when a property is set or deserialized with a different value.
- `Error` — captures validation/serialization errors with metadata about where they occurred.
- `Mount` / `Unmount` — triggered by `StateProxyManager` when proxies attach or detach (e.g., React components mounting/unmounting).

Decorators register handlers either on classes or plain-object models:

```ts
import {
    OnInit,
    OnChange,
    OnError,
    OnMount,
    OnUnmount,
    ValidationError,
    type OnChangeArgs,
    type OnErrorArgs,
    type OnMountArgs
} from '@fluxmodels/core'

class TodoModel {
    title = ''
    completed = false

    @OnInit()
    initialize() {
        console.log('State ready: ', this.title)
    }

    @OnChange()
    logChange({ propName, newValue }: OnChangeArgs) {
        console.log(`${propName as string} ->`, newValue)
    }

    @OnError()
    reportError({ error }: OnErrorArgs) {
        if (error instanceof ValidationError) {
            console.warn('Validation issue', error)
        }
    }

    @OnMount()
    onMount({context}: OnMountArgs) {
        console.log('Proxy mounted: ', JSON.stringify(context))
    }

    @OnUnmount()
    onUnmount() {
        console.log('Proxy unmounted')
    }
}

const [state] = StateManager.getOrCreateState(MyModel)
const [proxy] = StateProxyManager.getOrCreateStateProxy(state)

const context = { foo: 'bar' }

proxy.mount(() => {
    console.log('State changed, re-render')
}, context)

```

Custom events are supported via `EventsManager.newEvent(name?)`, which returns an event function/decorator pair you can reuse across models. All handlers can be subscribed imperatively using `eventsManager.subscribe(event, handler)` when decorators are not an option.

&nbsp;

### Runtime Validation and Serialization

FluxModels delegates **all runtime validation and snapshot (de)serialization** to [Metatyper](https://github.com/metatyper/metatyper).  
Every state created through `StateManager.getOrCreateState` is backed by a model (as schema).

> For a full list of constraints (`STRING`, `NUMBER`, object/array schemas, unions, etc.) and advanced options like `safe`, defaults and custom error messages, see **[Metatyper Validation](https://docs.metatyper.dev/#/?id=validation)**.  

> For details on how to plug your own serializers (e.g. Dates, branded IDs) into snapshots and network payloads, see **[Metatyper Serialization](https://docs.metatyper.dev/#/?id=serialization-and-deserialization)**.

#### Validation

Validation is about **making sure values written into a state match the schema you described**.

- **When it runs**
  - Every synchronous mutation (direct assignments, model methods, `update` callbacks, React updaters from `useModel`) is checked against the meta‑schema.
  - By default, invalid data **throws an error immediately** (Metatyper `ValidationError`), so you know exactly where the problem happened.

- **How to control it**
  - **`disableValidation: true` (or `metaArgs.validationIsActive = false`)**
    - Metatyper is **not called at all** for that state.
    - Use this for **trusted, pre‑validated data**: e.g. when you hydrate state from a known‑good server snapshot or load test fixtures.
  - **`safe: false`** (default: true)
    - Validation still runs and still produces validation errors, but **the write goes through anyway**.
    - This is handy when you prefer **"log but don't block UI"**:
      - for example, let users freely type into a complex form while you collect validation errors to show inline messages or to prevent final submission.
    - You can set it:
      - per state via `StateArgs.safe: false`,
      - or per field via Metatyper options, e.g. `STRING({ maxLength: 3, safe: false })`.
    - Combine with `@OnError()` / events to send all validation problems to a central logger, toast system, or error boundary.

Simple example:

```tsx
class UserModel {
    id = 0
    username = STRING({ maxLength: 3, default: '' })

    updateUsername(next: string) {
        this.username = next // throws if too long or not a string
    }
}
```

If you change `id` to a string, Metatyper will throw:

```tsx
const [user, updateUser] = useModel(UserModel)

try {
    updateUser({ id: 'oops' })
} catch (error) {
    // ValidationError, id must be a number
}
```

#### Serialization and Coercion

Serialization here means **turning your in‑memory state into a plain data shape (and back)**:

- from "raw" values that come from the outside world (JSON from an API, strings, numbers),
- into convenient JS types inside your models (`Date`, branded IDs, etc.),
- and then back to a raw form that is easy to store or send over the network.

**Coercion (automatic type conversion)** is the key feature:

- Imagine the backend sends a date as a number (`1700000000000`) or an ISO string (`"2024-01-01T12:00:00.000Z"`),
  but in your model you want a real `Date`:
  - You describe a meta‑type in Metatyper that knows how to:
    - take `number | string` from the outside,
    - convert it into `Date` for your model,
    - and serialize it back to the original shape when you send data out.
  - From FluxModels’ point of view, you just read `user.createdAt` as a `Date`, without worrying about how it came over the wire.

If Metatyper's serializer decides data is invalid or cannot be converted (for example, a broken date string), it throws a serialization error that goes through the **same error channel as validation errors**, so you can handle it either locally (try/catch) or via global error handlers.

Example:

```tsx
import { StateManager, StateProxyManager, DATE } from '@fluxmodels/core'

class UserModel {
    id = 0
    name = STRING({ trim: true })
    createdAt = DATE()
}

const rawFromApi = {
    id: 1,
    name: '  user1 '
    createdAt: '2024-01-01T12:00:00.000Z'
}

const [user] = StateManager.getOrCreateState(UserModel)

Object.assign(user, rawFromApi)

user.name === 'user1' // trimmed during deserialization (leading/trailing spaces removed)
user.createdAt instanceof Date // true - string was automatically converted to Date object
```

&nbsp;

### State Errors Handling

Runtime validation and serialization are strict by default: when something goes wrong, FluxModels lets the error surface immediately so you can either handle it locally or route it to a global observer.

- **Validation errors** – Metatyper throws [`ValidationError`](https://docs.metatyper.dev/#/?id=validation) (and related subclasses) when field constraints are violated.
- **Serialization / coercion errors** – serializers can throw `MetaSerializerError` if a value cannot be converted or restored.
- **Error phases** – errors can appear during `get`, `set`, `validate`, `serialize` and other phases; FluxModels forwards them through the same error channel. See the [Metatyper errors docs](https://docs.metatyper.dev/#/?id=errors) for the full taxonomy.
- **Synchronous bubbling** – assignments, model methods and `useModel` updaters all propagate these errors synchronously, so a single `try/catch` around the mutation is enough to intercept them.

Handle errors as close as possible to the mutation:

```ts
import { StateManager, ValidationError } from '@fluxmodels/core'

const [profile] = StateManager.getOrCreateState(ProfileModel)

try {
    profile.age = 'unknown'
} catch (error) {
    if (error instanceof ValidationError) {
        // roll back UI or show a message
    } else {
        throw error
    }
}
```

For cross-cutting concerns (logging, telemetry, global notifications), you can subscribe to [`@OnError`](docs/api/core/src/variables/OnError.md). The decorator receives every failure together with the state instance and the phase (`get`, `set`, `validate`, etc.), so you can aggregate and react to errors centrally:


```tsx
import { Meta, STRING, OnError, ValidationError, type ValidatorType } from '@fluxmodels/core'

const CustomValidator: ValidatorType = {
    name: 'Custom',
    validate: ({ value }) => {
        if (value === 'error') {
            throw new Error('Custom validator failed. Value is "error"')
        }
        if (value === 'error2') {
            return false
        }
        return true
    }
}

class ProfileFormModel {
    name = STRING({
        safe: false,  // allow setting invalid values (errors won't block assignment)

        default: '',
        trim: true,
        minLength: 2,
        maxLength: 16,
        regexp: /^[a-zA-Z0-9-_]+$/,

        validators: [CustomValidator]
    })

    email = STRING({
        safe: false,

        default: '',
        trim: true,
        minLength: 5,
        maxLength: 16,
        regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // simplified email check for demo purposes
    })

    nameError = ''
    emailError = ''

    updateName(value: string) {
        this.nameError = ''
        this.name = value
    }

    updateEmail(value: string) {
        this.emailError = ''
        this.email = value
    }

    handleSubmit() {
        const error = Meta.validate(this, this)

        if (error) {
            this.onError({ error, allowEmpty: false })
            throw error
        }

        alert('Form submitted successfully')

        this.name = ''
        this.email = ''
    }

    @OnError()
    onError({ error, allowEmpty = true }: { error: Error, allowEmpty?: boolean }) {
        if (error instanceof ValidationError) {
            let nameError = ''
            let emailError = ''

            error.issues.forEach((issue) => {
                // don't show error when empty
                if (allowEmpty && !issue.value) {
                    return
                }

                let subMessage = ''

                switch (issue.code) {
                    case 'MinLength':
                        subMessage = `Name must be at least ${issue.validator.context?.minLength} characters long`
                        break
                    case 'MaxLength':
                        subMessage = `Name must be at most ${issue.validator.context?.maxLength} characters long`
                        break
                    case 'RegExp':
                        subMessage = 'Invalid format'
                        break
                    case 'Custom':
                        subMessage = issue.subError?.message || 'Custom error'
                        break
                }

                switch (issue.path[0]) {
                    case 'name':
                        nameError += `- Invalid name. ${subMessage}\n`
                        break
                    case 'email':
                        emailError = `- Invalid email. ${subMessage}\n`
                        break
                }
            })

            if (nameError) {
                this.nameError = nameError
            }
            if (emailError) {
                this.emailError = emailError
            }
        } else {
            console.error(error)
        }
    }
}
```

```tsx
import React from 'react'
import { useModel } from '@fluxmodels/react'

export function ProfileForm() {
    const [form] = useModel(ProfileFormModel)

    return (
        <form onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
        }} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
            <label style={{ display: 'grid', gap: 4 }}>
                <span>Name</span>

                <input
                    value={form.name}
                    onChange={(e) => form.updateName(e.target.value)}
                />

                {form.nameError && (
                    <span style={{ color: 'crimson', fontSize: 12 }}>
                        {form.nameError}
                    </span>
                )}
            </label>

            <label style={{ display: 'grid', gap: 4 }}>
                <span>Email</span>

                <input
                    value={form.email}
                    onChange={(e) => form.updateEmail(e.target.value)}
                />

                {form.emailError && (
                    <span style={{ color: 'crimson', fontSize: 12 }}>
                        {form.emailError}
                    </span>
                )}
            </label>

            <button type="submit">Save profile</button>
        </form>
    )
}

export default function App() {
    return (
        <div>
            <ProfileForm />
        </div>
    )
}
```

&nbsp;

### Utils

FluxModels ships metatypes that expose runtime metadata from StateManagers directly on your states. They resolve lazily and always reflect the current instance, even when accessed through proxies.

- [`KEY()`](docs/api/core/src/functions/KEY.md) – returns the effective key passed to `StateManager.getOrCreateState` (falls back to the default symbol).
- [`STORE()`](docs/api/core/src/functions/STORE.md) – returns the owning [`StateStore`](#statestore).
- [`MODEL()`](docs/api/core/src/functions/MODEL.md) – returns the constructor or object that produced the state.

In addition to metatypes, there are function helpers that accept an existing state object and return the same metadata. They are useful for defining getters, working with plain objects, or when you cannot use decorators/fields with `KEY()`, `STORE()`, or `MODEL()` directly.

- [`getKey(state)`](docs/api/core/src/functions/getKey.md) – returns the key of the given state.
- [`getStore(state)`](docs/api/core/src/functions/getStore.md) – returns the `StateStore` that owns the given state.
- [`getModel(state)`](docs/api/core/src/functions/getModel.md) – returns the model (constructor/object) that produced the given state.

```ts
import { KEY, STORE, MODEL, StateManager, StateStore, getKey, getStore, getModel } from '@fluxmodels/core'

class TypedState {
    key = KEY()
    store = STORE()
    model = MODEL()

    // alternatives

    // get key() {
    //     return getKey(this)
    // }

    // get store() {
    //     return getStore(this)
    // }

    // get mdoel() {
    //     return getModel(this)
    // }
}

const [state] = StateManager.getOrCreateState(TypedState, { key: 'debug' })

state.key // 'debug'
state.store === StateStore.defaultStore // true
state.model === TypedState // true

// Read through proxies as well
const [proxy] = StateProxyManager.getOrCreateStateProxy(state)
proxy.store // same value
```

> These properties are read-only; attempting to assign to them throws. Use them to forward metadata to injected children or to inspect states inside debugging panels and lifecycle hooks.

> More utils you can find here: [`Metatyper docs`](https://docs.metatyper.dev/#/?id=meta-objects)

&nbsp;

# API Reference

API reference is here: 
[Core](docs/api/core/src/README.md) · 
[React](docs/api/react/src/README.md)

&nbsp;

# Similar Libraries

- [MobX](https://mobx.js.org/): Reactive state management with observables and classes. MobX uses a more object-oriented approach, allowing for easy integration of existing codebases.

- [Redux](https://redux.js.org/): Centralizes application state and logic. Redux follows a strict unidirectional data flow and is known for its predictability and powerful developer tools.

- [Valtio](https://valtio.pmnd.rs/): Proxy-based state management for React and Vanilla. Valtio offers a simple API and efficient updates, making it easy to adopt in both small and large projects.

- [Jotai](https://jotai.org/): Atomic state management for React. Jotai provides a minimalistic approach to state management, focusing on composability and flexibility.

- [Zustand](https://zustand-demo.pmnd.rs/): A small, fast, and scalable state management solution. Zustand is known for its simplicity and ease of use, especially in React applications.

- [Zod](https://zod.dev/): A TypeScript-first schema declaration and validation library. It offers a concise API for defining complex data structures and ensures type safety at runtime.

- [Yup](https://github.com/jquense/yup): A JavaScript schema builder for value parsing and validation. It provides an intuitive, chainable interface for creating validation schemas.

- [Joi](https://joi.dev/): A powerful schema description language and data validator for JavaScript. It supports an extensive set of validation rules and is highly customizable.

These libraries each have their own strengths and use cases, catering to different project needs and developer preferences.

While these libraries offer various state management and validation solutions,

FluxModels stands out by combining state management and data validation into a single, cohesive solution. It seamlessly integrates with both React and non-React environments, providing a unified approach to handling application state and ensuring data integrity.

By merging these crucial aspects of application development, FluxModels simplifies the development process and reduces the need for multiple libraries. It offers advanced features like runtime validation/serialization, DI, and a robust event management system, making it an excellent choice for modern application development.

&nbsp;

# Change Log

Stay updated with the latest changes and improvements: [GitHub Releases](https://github.com/fluxmodels/fluxmodels/releases).
