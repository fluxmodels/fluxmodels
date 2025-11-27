[**@fluxmodels/fluxmodels**](../../README.md)

***

## Classes

<table>
<thead>
<tr>
<th>Class</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

[EventsManager](classes/EventsManager.md)

</td>
<td>

Class responsible for managing events and their handlers.

</td>
</tr>
<tr>
<td>

[StateManager](classes/StateManager.md)

</td>
<td>

StateManager is a class responsible for managing the lifecycle of states.
It provides functionality for:
- Creating new states
- Searching for existing states
- Storing and retrieving metadata associated with states
- Managing state operations and updates

</td>
</tr>
<tr>
<td>

[StateProxyManager](classes/StateProxyManager.md)

</td>
<td>

Manages the lifecycle, observation, and snapshotting of a state proxy.

</td>
</tr>
<tr>
<td>

[StateStore](classes/StateStore.md)

</td>
<td>

StateStore is responsible for managing and storing state instances.
It provides methods to find, retrieve, and add states associated with models.

The store uses a two-level map structure:
- The outer map uses the model as the key and stores an inner map for each model.
- The inner map uses a custom key (or a default symbol) to store individual state instances.

This structure allows efficient storage and retrieval of states based on their models and keys from the RAM memory.

</td>
</tr>
</tbody>
</table>

## Functions

<table>
<thead>
<tr>
<th>Function</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

[getKey](functions/getKey.md)

</td>
<td>

Returns the key of the state.

**Example**

```ts
class UserModel {
    username = '',

    get key() {
        return getKey(this)
    }
}

const [userState] = StateManager.getOrCreateState(UserModel, { key: 1 })
console.log(getKey(userState)) // 1
```

</td>
</tr>
<tr>
<td>

[getModel](functions/getModel.md)

</td>
<td>

Returns the model of the state.

</td>
</tr>
<tr>
<td>

[getStore](functions/getStore.md)

</td>
<td>

Returns the store of the state.

Example:
```ts
class UserModel {
    username = '',

    get store() {
        return getStore(this)
    }
}

const [userState] = StateManager.getOrCreateState(UserModel)
console.log(getStore(userState)) // StateStore.defaultStore
```

</td>
</tr>
<tr>
<td>

[InjectModel](functions/InjectModel.md)

</td>
<td>

Creates a read-only property that returns a state or state proxy (new or from the store).
When you read the property, FluxModels calls `StateManager.getOrCreateState()` with the provided model.
If the parent state is a proxy, the property will return a state proxy.

**Examples**

Basic usage:

```ts
class Inner { name = 'x' }
class Outer {
  inner = InjectModel(Inner)
  items = InjectModel([Inner])
}
```

Dynamic model accessor with array injection.
Returns a readonly array of states determined by a function that computes the model based on state and key.

```ts
class Item { id = '' }
class List {
  type = 'user'
  keys = ['a', 'b']
  items = InjectModel([(state, key) => state.type === 'user' ? UserModel : ItemModel], {
    keyFrom: 'keys'
  })
}
```

</td>
</tr>
<tr>
<td>

[isPromiseLike](functions/isPromiseLike.md)

</td>
<td>

Lightweight check whether a value behaves like a Promise (thenable/catch/finally).

</td>
</tr>
<tr>
<td>

[KEY](functions/KEY.md)

</td>
<td>

Creates a dynamic property that returns a key of the state.

**Example**

Usage example:

```ts
class User {
  id = KEY()
}

const [state] = StateManager.getOrCreateState(User, { key: 'user1' })
const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state)

console.log(stateProxy.id) // 'user1'

```

</td>
</tr>
<tr>
<td>

[MODEL](functions/MODEL.md)

</td>
<td>

Creates a dynamic property that returns the model object.

**Example**

Usage example:

```ts
class User {
  model = MODEL()
}

class UserWithProfile extends User {
  name = ''
}

const [state] = StateManager.getOrCreateState(UserWithProfile, { key: 'user1' })
const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state)

console.log(stateProxy.model) // UserWithProfile

```

</td>
</tr>
<tr>
<td>

[STORE](functions/STORE.md)

</td>
<td>

Creates a dynamic property that returns the StateStore instance where the state is stored.

**Example**

Usage example:

```ts
class User {
  store = STORE()

  usersCount(){
    return this.store.findStates(User).length
  }
}

const MyComponent = (props) => {
  const [user] = useModel(User, { key: props.userId })

  return (
    <div>
      <h1>Users Count: {user.usersCount()}</h1>
    </div>
  )
}

```

</td>
</tr>
</tbody>
</table>

## Type Aliases

<table>
<thead>
<tr>
<th>Type Alias</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

[AnyRecord](type-aliases/AnyRecord.md)

</td>
<td>

Represents the loosest object shape supported by the FluxModels state runtime.

This alias keeps the API expressive while mapping to `Record<string | number | symbol, any>`.

</td>
</tr>
<tr>
<td>

[Event](type-aliases/Event.md)

</td>
<td>

Decorator-compatible event definition produced by factories in `events/`.

Calling the event with a handler registers it immediately, while calling with no arguments
returns a decorator that binds the handler to class methods.

</td>
</tr>
<tr>
<td>

[EventDecorator](type-aliases/EventDecorator.md)

</td>
<td>

Decorator signature returned by [Event](type-aliases/Event.md) when used without arguments.

Compatible with standard TypeScript decorators and used internally by [EventsManager](classes/EventsManager.md).

</td>
</tr>
<tr>
<td>

[EventHandler](type-aliases/EventHandler.md)

</td>
<td>

Generic signature implemented by all FluxModels event handlers.

</td>
</tr>
<tr>
<td>

[IfEquals](type-aliases/IfEquals.md)

</td>
<td>

&hyphen;

</td>
</tr>
<tr>
<td>

[InjectedState](type-aliases/InjectedState.md)

</td>
<td>

Convenience helper to tag an object as an injected dependency.

The optional `_injected` flag is consumed by [IsInjectedStateType](type-aliases/IsInjectedStateType.md) and the state/proxy
managers to decide how to wrap the property during state construction.

</td>
</tr>
<tr>
<td>

[InjectModelArgs](type-aliases/InjectModelArgs.md)

</td>
<td>

Extends [StateProxyArgs](type-aliases/StateProxyArgs.md) with knobs specific to injected dependencies.

Options such as `keyFrom`, `optional`, and `nullable` are interpreted by the metadata layer
(see `metatypes/InjectModel`) when preparing nested state proxies.

**Type Param**

Whether the dependency may be omitted.

**Type Param**

Whether the dependency may be `null`.

</td>
</tr>
<tr>
<td>

[InjectModelDynamicArgs](type-aliases/InjectModelDynamicArgs.md)

</td>
<td>

Injection configuration that can be provided statically or derived from the parent state.

The functional form is handy when the injected proxy key or store depends on runtime state.

</td>
</tr>
<tr>
<td>

[IsInjectedStateType](type-aliases/IsInjectedStateType.md)

</td>
<td>

Predicate that evaluates to `true` for values marked via [InjectedState](type-aliases/InjectedState.md).

Injection-aware helpers rely on this marker to determine whether a property should be
lazily resolved into another state or proxy instead of being copied.

</td>
</tr>
<tr>
<td>

[IsStateOrStateProxyType](type-aliases/IsStateOrStateProxyType.md)

</td>
<td>

Predicate that resolves to `true` when the value is either a state or a state proxy.

This is convenient for APIs that accept both raw states and proxies interchangeably.

</td>
</tr>
<tr>
<td>

[IsStateProxyType](type-aliases/IsStateProxyType.md)

</td>
<td>

Type-level predicate that evaluates to `true` when the value is a FluxModels state proxy.

Proxies are created by [StateProxyManager](classes/StateProxyManager.md) and expose the IsStateProxySymbol
marker consumed by this helper.

</td>
</tr>
<tr>
<td>

[IsStateType](type-aliases/IsStateType.md)

</td>
<td>

Type-level predicate that evaluates to `true` when the value is a FluxModels state.

The helper unwraps nullable and array types before checking for the hidden
IsStateSymbol marker attached by [StateManager](classes/StateManager.md).

</td>
</tr>
<tr>
<td>

[MountHandlerType](type-aliases/MountHandlerType.md)

</td>
<td>

&hyphen;

</td>
</tr>
<tr>
<td>

[ObservableProps](type-aliases/ObservableProps.md)

</td>
<td>

Normalized map indicating which properties of a state proxy should be observed.

Values can be booleans or nested structures to express deep observability preferences.
When properties are included in this map, changes to them trigger reactivity, causing
mount handlers (rerender functions) to be invoked.

Observable properties can be specified explicitly during proxy mounting via [StateProxyArgs](type-aliases/StateProxyArgs.md).
Additionally, when `autoResolveObservableProps` is set to `true`, reading properties from the
state proxy will automatically add them to the observable properties map, enabling automatic
reactivity tracking based on actual property access patterns.

</td>
</tr>
<tr>
<td>

[ObservablePropsArgs](type-aliases/ObservablePropsArgs.md)

</td>
<td>

Input accepted when configuring observable properties on a proxy.

The configuration can be a simple iterable of keys or a structured object that mirrors
nested state shape. Internal helpers convert this into [ObservableProps](type-aliases/ObservableProps.md).

</td>
</tr>
<tr>
<td>

[OnChangeArgs](type-aliases/OnChangeArgs.md)

</td>
<td>

Arguments passed to [OnChange](variables/OnChange.md) handlers.

</td>
</tr>
<tr>
<td>

[OnChangeHandler](type-aliases/OnChangeHandler.md)

</td>
<td>

Handler signature for [OnChange](variables/OnChange.md) events.

</td>
</tr>
<tr>
<td>

[OnErrorArgs](type-aliases/OnErrorArgs.md)

</td>
<td>

Arguments passed to [OnError](variables/OnError.md) handlers.

</td>
</tr>
<tr>
<td>

[OnErrorHandler](type-aliases/OnErrorHandler.md)

</td>
<td>

Handler signature for [OnError](variables/OnError.md) events.

</td>
</tr>
<tr>
<td>

[OnInitArgs](type-aliases/OnInitArgs.md)

</td>
<td>

Arguments passed to [OnInit](variables/OnInit.md) handlers.

</td>
</tr>
<tr>
<td>

[OnInitHandler](type-aliases/OnInitHandler.md)

</td>
<td>

Handler signature for [OnInit](variables/OnInit.md) events.

</td>
</tr>
<tr>
<td>

[OnMountArgs](type-aliases/OnMountArgs.md)

</td>
<td>

Arguments passed to [OnMount](variables/OnMount.md) handlers.

</td>
</tr>
<tr>
<td>

[OnMountHandler](type-aliases/OnMountHandler.md)

</td>
<td>

Handler signature for [OnMount](variables/OnMount.md) events.

</td>
</tr>
<tr>
<td>

[OnUnmountArgs](type-aliases/OnUnmountArgs.md)

</td>
<td>

Arguments passed to [OnUnmount](variables/OnUnmount.md) handlers.

</td>
</tr>
<tr>
<td>

[OnUnmountHandler](type-aliases/OnUnmountHandler.md)

</td>
<td>

Handler signature for [OnUnmount](variables/OnUnmount.md) events.

</td>
</tr>
<tr>
<td>

[State](type-aliases/State.md)

</td>
<td>

Concrete shape of a FluxModels state managed by [StateManager](classes/StateManager.md).

The type preserves the model's ordinary properties and remaps injected properties so that
consumers receive wrapped states or proxies when appropriate. Internal metadata symbols
remain hidden from typical iteration.

</td>
</tr>
<tr>
<td>

[StateArgs](type-aliases/StateArgs.md)

</td>
<td>

Configuration accepted when creating or retrieving a state via [StateManager](classes/StateManager.md).

Use these options to override the storage location, assign initial values, or provide
metadata arguments for metatyper validation.

</td>
</tr>
<tr>
<td>

[StateKey](type-aliases/StateKey.md)

</td>
<td>

Identifier used to register a state within a [StateStore](classes/StateStore.md).

Keys allow multiple instances of the same model to coexist in the store.

</td>
</tr>
<tr>
<td>

[StateModel](type-aliases/StateModel.md)

</td>
<td>

Model definition that [StateManager](classes/StateManager.md) can use to construct a state.

A model can either be a plain object (used as-is) or a constructor that produces the state
instance when invoked.

</td>
</tr>
<tr>
<td>

[StateProxy](type-aliases/StateProxy.md)

</td>
<td>

Reactive facade over a state returned by [StateProxyManager](classes/StateProxyManager.md).

State proxies mirror the surface of the backing state while exposing read-only injected
relationships as nested proxies. They are commonly consumed by view-layer integrations.

</td>
</tr>
<tr>
<td>

[StateProxyArgs](type-aliases/StateProxyArgs.md)

</td>
<td>

Options that influence how [StateProxyManager](classes/StateProxyManager.md) mounts and manages a state proxy.

Controls observable property detection and lifecycle hooks for injected proxies.

</td>
</tr>
<tr>
<td>

[StateProxyManagerArgs](type-aliases/StateProxyManagerArgs.md)

</td>
<td>

Configuration accepted by the [StateProxyManager](classes/StateProxyManager.md) constructor.

Extends [StateProxyArgs](type-aliases/StateProxyArgs.md) with additional options for managing injected state proxies
and their lifecycle initialization.

</td>
</tr>
<tr>
<td>

[StateSnapshot](type-aliases/StateSnapshot.md)

</td>
<td>

Immutable view of a state captured via [StateProxyManager](classes/StateProxyManager.md).

Snapshots freeze the current state values while preserving type information for injected
structures so they can be safely read outside of reactive contexts.

Snapshots are side-effect free.

</td>
</tr>
<tr>
<td>

[WritableKeys](type-aliases/WritableKeys.md)

</td>
<td>

&hyphen;

</td>
</tr>
</tbody>
</table>

## Variables

<table>
<thead>
<tr>
<th>Variable</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

[DEFAULT\_STATE\_KEY](variables/DEFAULT_STATE_KEY.md)

</td>
<td>

Sentinel key assigned when a state is stored without an explicit key.
`StateStore.addState` and `InjectModelImpl` rely on it to group states under a predictable default entry.

</td>
</tr>
<tr>
<td>

[DefaultStoreSymbol](variables/DefaultStoreSymbol.md)

</td>
<td>

Global key used by `StateStore.defaultStore` to cache the singleton store on `globalThis`.
The symbol ensures the default store instance is shared safely across module boundaries.

</td>
</tr>
<tr>
<td>

[INJECT\_KEY](variables/INJECT_KEY.md)

</td>
<td>

Marker value for `InjectModel` configurations that should reuse the parent state's key.
When `keyFrom` equals `INJECT_KEY`, `InjectModelImpl` reads the key from the current state via `StateManager.instance()`.

</td>
</tr>
<tr>
<td>

[INJECT\_STORE](variables/INJECT_STORE.md)

</td>
<td>

Marker value for `InjectModel` configurations that should reuse the parent state's store.
When encountered, `InjectModelImpl` replaces it with the store resolved from `StateManager.instance()`.

</td>
</tr>
<tr>
<td>

[OnChange](variables/OnChange.md)

</td>
<td>

Creates an event that fires whenever a state property changes.

Handlers must satisfy [OnChangeHandler](type-aliases/OnChangeHandler.md).

**Example**

```ts
class CounterModel {
    count = 0

    @OnChange()
    handleChange(args: OnChangeArgs) {
        console.log(`${String(args.propName)} changed from`, args.prevValue, 'to', args.newValue)
    }
}

const CounterModel = {
    count: 0,
    handleChange: OnChange((args: OnChangeArgs) => {
        console.log('Changed prop:', args.propName)
    })
}
```

</td>
</tr>
<tr>
<td>

[OnError](variables/OnError.md)

</td>
<td>

Creates an event that fires when an error occurs while mutating or resolving state.

Handlers must satisfy [OnErrorHandler](type-aliases/OnErrorHandler.md).

**Example**

```ts
class FormModel {
    error = ''

    @OnError()
    handleError(args: OnErrorArgs) {
        this.error = `Failed during ${args.errorPlace}: ${args.error.message}`
    }
}

const FormModel = {
    error: '',
    handleError: OnError((args: OnErrorArgs) => {
        console.error('State error', args.error)
    })
}
```

</td>
</tr>
<tr>
<td>

[OnInit](variables/OnInit.md)

</td>
<td>

Creates an event that fires when a state finishes initialization.

Handlers must satisfy [OnInitHandler](type-aliases/OnInitHandler.md).

**Examples**

```ts
class SessionModel {
    token = ''

    @OnInit()
    hydrate(args: OnInitArgs) {
        args.state.token = window.sessionStorage.getItem('token') ?? ''
    }
}
```

```ts
class UserProfileModel {
    name = ''
}
class UserModel {
    profile = InjectModel(UserProfileModel, { keyFrom: INJECT_KEY })

    @OnInit()
    async loadProfile(args: OnInitArgs) {
        args.state.profile = await fetch('/api/profile').then(r => r.json())
    }
}
```

</td>
</tr>
<tr>
<td>

[OnMount](variables/OnMount.md)

</td>
<td>

Creates an event that fires when a state proxy is mounted.

Handlers must satisfy [OnMountHandler](type-aliases/OnMountHandler.md).

**Example**

```ts
class TodoListModel {
    items: string[] = []

    @OnMount()
    setupEffects({ context }: OnMountArgs) {
        console.log('Mounted with render context', context)
    }
}
```

</td>
</tr>
<tr>
<td>

[OnUnmount](variables/OnUnmount.md)

</td>
<td>

Creates an event that fires when a state proxy is unmounted.

Handlers must satisfy [OnUnmountHandler](type-aliases/OnUnmountHandler.md).

**Example**

```ts
class TodoListModel {
    @OnUnmount()
    teardown({ stateProxy }: OnUnmountArgs) {
        console.log('Unmounting proxy', stateProxy)
    }
}
```

</td>
</tr>
</tbody>
</table>
