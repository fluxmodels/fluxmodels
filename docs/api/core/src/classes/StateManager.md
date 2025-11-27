[**@fluxmodels/fluxmodels**](../../../README.md)

***

Defined in: [core/src/StateManager.ts:32](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L32)

StateManager is a class responsible for managing the lifecycle of states.
It provides functionality for:
- Creating new states
- Searching for existing states
- Storing and retrieving metadata associated with states
- Managing state operations and updates

## Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
<th>Default type</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`T` *extends* [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
<td>

[`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
</tbody>
</table>

## Accessors

### eventsManager

#### Get Signature

```ts
get eventsManager(): EventsManager;
```

Defined in: [core/src/StateManager.ts:57](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L57)

##### Returns

[`EventsManager`](EventsManager.md)

***

### propNamesWithStates

#### Get Signature

```ts
get propNamesWithStates(): readonly string[];
```

Defined in: [core/src/StateManager.ts:67](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L67)

A list of property names that have states (e.g. InjectModel).

##### Returns

readonly `string`[]

***

### stateId

#### Get Signature

```ts
get stateId(): string;
```

Defined in: [core/src/StateManager.ts:53](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L53)

##### Returns

`string`

***

### version

#### Get Signature

```ts
get version(): number;
```

Defined in: [core/src/StateManager.ts:62](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L62)

Whether the state is dirty (has changes).

##### Returns

`number`

## Constructors

### Constructor

```ts
new StateManager<T>(
   state: State, 
   model: StateModel<T>, 
   key: string, 
store: StateStore): StateManager<T>;
```

Defined in: [core/src/StateManager.ts:101](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L101)

Creates a `StateManager` bound to a specific state instance.
Prefer using [StateManager.getOrCreateState](#getorcreatestate) to construct states.

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`state`

</td>
<td>

[`State`](../type-aliases/State.md)

</td>
<td>

The state instance.

</td>
</tr>
<tr>
<td>

`model`

</td>
<td>

[`StateModel`](../type-aliases/StateModel.md)\<`T`\>

</td>
<td>

The model class/object used to create the state.

</td>
</tr>
<tr>
<td>

`key`

</td>
<td>

`string`

</td>
<td>

The state's key.

</td>
</tr>
<tr>
<td>

`store`

</td>
<td>

[`StateStore`](StateStore.md)

</td>
<td>

Store where the state is kept.

</td>
</tr>
</tbody>
</table>

#### Returns

`StateManager`\<`T`\>

## Methods

### getRelatedProps()

```ts
getRelatedProps(propName: string): readonly string[];
```

Defined in: [core/src/StateManager.ts:183](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L183)

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`propName`

</td>
<td>

`string`

</td>
</tr>
</tbody>
</table>

#### Returns

readonly `string`[]

***

### markRelatedProps()

```ts
markRelatedProps(propName: string, relatedPropName: string): void;
```

Defined in: [core/src/StateManager.ts:159](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L159)

Marks a property as a related property. Used to track properties that are related to a state property.
Useful for mark observable properties for state proxy.
Related property will be observable if state property is observable.

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`propName`

</td>
<td>

`string`

</td>
<td>

The property name to mark.

</td>
</tr>
<tr>
<td>

`relatedPropName`

</td>
<td>

`string`

</td>
<td>

The related property name.

</td>
</tr>
</tbody>
</table>

#### Returns

`void`

***

### markStateProperty()

```ts
markStateProperty(propName: string): void;
```

Defined in: [core/src/StateManager.ts:147](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L147)

Marks a property as a state property. Used to track properties that have states (e.g. InjectModel).

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`propName`

</td>
<td>

`string`

</td>
<td>

The property name to mark.

</td>
</tr>
</tbody>
</table>

#### Returns

`void`

***

### representState()

```ts
representState(): string;
```

Defined in: [core/src/StateManager.ts:131](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L131)

Returns a human-friendly string representation of the state.

#### Returns

`string`

***

### trackRelatedProps()

```ts
trackRelatedProps<R>(propName: string, callback: () => R): R;
```

Defined in: [core/src/StateManager.ts:167](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L167)

#### Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`R`

</td>
</tr>
</tbody>
</table>

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`propName`

</td>
<td>

`string`

</td>
</tr>
<tr>
<td>

`callback`

</td>
<td>

() => `R`

</td>
</tr>
</tbody>
</table>

#### Returns

`R`

***

### createState()

```ts
static createState<T>(model: StateModel<T>, args?: StateArgs<T>): [State<T>];
```

Defined in: [core/src/StateManager.ts:263](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L263)

Creates a new state for the given model and arguments.

#### Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`T` *extends* [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
</tbody>
</table>

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`model`

</td>
<td>

[`StateModel`](../type-aliases/StateModel.md)\<`T`\>

</td>
<td>

The model class/object used to create the state.

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

[`StateArgs`](../type-aliases/StateArgs.md)\<`T`\>

</td>
<td>

Optional state creation arguments (key, store, initialValues, meta args, etc.).

</td>
</tr>
</tbody>
</table>

#### Returns

\[[`State`](../type-aliases/State.md)\<`T`\>\]

A tuple `[state]` where `state` is the created state.

***

### getEventsManager()

```ts
static getEventsManager(targetObject: object): EventsManager;
```

Defined in: [core/src/StateManager.ts:201](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L201)

Creates a new [EventsManager](EventsManager.md) instance for the provided object.

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`targetObject`

</td>
<td>

`object`

</td>
<td>

The object that will own event handlers.

</td>
</tr>
</tbody>
</table>

#### Returns

[`EventsManager`](EventsManager.md)

A new `EventsManager` instance.

***

### getOrCreateState()

```ts
static getOrCreateState<T>(model: StateModel<T>, args?: StateArgs<T>): readonly [State<T>, boolean];
```

Defined in: [core/src/StateManager.ts:234](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L234)

Returns an existing state for the model and key, or creates a new one.

#### Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`T` *extends* [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
</tbody>
</table>

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`model`

</td>
<td>

[`StateModel`](../type-aliases/StateModel.md)\<`T`\>

</td>
<td>

The model class/object used to build the state.

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

[`StateArgs`](../type-aliases/StateArgs.md)\<`T`\>

</td>
<td>

Optional state creation arguments (key, store, initialValues, meta args, etc.).

</td>
</tr>
</tbody>
</table>

#### Returns

readonly \[[`State`](../type-aliases/State.md)\<`T`\>, `boolean`\]

A tuple `[state, isNew]` where `isNew` is `true` when a new state was created.

***

### instance()

#### Call Signature

```ts
static instance<T, ST>(state: ST): StateManager<ST extends State<U> ? U : T>;
```

Defined in: [core/src/StateManager.ts:42](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L42)

Returns the `StateManager` instance attached to a given state or state proxy.

This allows accessing state-level context, events, and utilities
from anywhere you have the state (or its proxy).

##### Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`T` *extends* [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
<tr>
<td>

`ST` *extends* [`State`](../type-aliases/State.md)\<`T`\>

</td>
</tr>
</tbody>
</table>

##### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`state`

</td>
<td>

`ST`

</td>
<td>

A FluxModels state or state proxy.

</td>
</tr>
</tbody>
</table>

##### Returns

`StateManager`\<`ST` *extends* [`State`](../type-aliases/State.md)\<`U`\> ? `U` : `T`\>

The associated `StateManager` (or `undefined` for non-states).

#### Call Signature

```ts
static instance(state: State): StateManager;
```

Defined in: [core/src/StateManager.ts:45](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L45)

Returns the `StateManager` instance attached to a given state or state proxy.

This allows accessing state-level context, events, and utilities
from anywhere you have the state (or its proxy).

##### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`state`

</td>
<td>

[`State`](../type-aliases/State.md)

</td>
<td>

A FluxModels state or state proxy.

</td>
</tr>
</tbody>
</table>

##### Returns

`StateManager`

The associated `StateManager` (or `undefined` for non-states).

#### Call Signature

```ts
static instance<T>(state: T): StateManager<T> | undefined;
```

Defined in: [core/src/StateManager.ts:46](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L46)

Returns the `StateManager` instance attached to a given state or state proxy.

This allows accessing state-level context, events, and utilities
from anywhere you have the state (or its proxy).

##### Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`T` *extends* [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
</tbody>
</table>

##### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`state`

</td>
<td>

`T`

</td>
<td>

A FluxModels state or state proxy.

</td>
</tr>
</tbody>
</table>

##### Returns

`StateManager`\<`T`\> \| `undefined`

The associated `StateManager` (or `undefined` for non-states).

***

### isIgnoredProp()

```ts
static isIgnoredProp(propName: string | symbol): boolean;
```

Defined in: [core/src/StateManager.ts:211](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L211)

Returns true if a property should be ignored by the state machinery (private, symbol, etc.).

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`propName`

</td>
<td>

`string` \| `symbol`

</td>
<td>

The property name to check.

</td>
</tr>
</tbody>
</table>

#### Returns

`boolean`

Whether the property is ignored.

***

### isState()

```ts
static isState(state: any): boolean;
```

Defined in: [core/src/StateManager.ts:482](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L482)

Checks whether the given value is a FluxModels State instance.

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`state`

</td>
<td>

`any`

</td>
<td>

Value to check.

</td>
</tr>
</tbody>
</table>

#### Returns

`boolean`

Whether the value is a FluxModels State.

***

### prepareKey()

```ts
static prepareKey(key?: string): string;
```

Defined in: [core/src/StateManager.ts:223](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L223)

Normalizes a provided key to either the given value or a default key symbol.

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`key?`

</td>
<td>

`string`

</td>
<td>

Optional key value.

</td>
</tr>
</tbody>
</table>

#### Returns

`string`

The provided key or a default key symbol.

***

### removeState()

```ts
static removeState(state: State): void;
```

Defined in: [core/src/StateManager.ts:567](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L567)

Removes a state from the store.

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`state`

</td>
<td>

[`State`](../type-aliases/State.md)

</td>
<td>

The state to remove.

</td>
</tr>
</tbody>
</table>

#### Returns

`void`

***

### upsertStates()

```ts
static upsertStates<T>(
   model: StateModel<T>, 
   statesData: Record<StateKey, T>, 
   args?: Omit<StateArgs<T>, "key" | "initialValues">): State<T>[];
```

Defined in: [core/src/StateManager.ts:541](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L541)

Upserts states for the given model and data.

#### Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`T` *extends* [`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
</tr>
</tbody>
</table>

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`model`

</td>
<td>

[`StateModel`](../type-aliases/StateModel.md)\<`T`\>

</td>
<td>

The model to upsert states for.

</td>
</tr>
<tr>
<td>

`statesData`

</td>
<td>

`Record`\<[`StateKey`](../type-aliases/StateKey.md), `T`\>

</td>
<td>

The data to upsert states for.

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

`Omit`\<[`StateArgs`](../type-aliases/StateArgs.md)\<`T`\>, `"key"` \| `"initialValues"`\>

</td>
<td>

Optional arguments to pass to the state creation.

</td>
</tr>
</tbody>
</table>

#### Returns

[`State`](../type-aliases/State.md)\<`T`\>[]

An array of states.

***

### waitForInit()

```ts
static waitForInit(state: State): Promise<void>;
```

Defined in: [core/src/StateManager.ts:492](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L492)

Waits for the state to be initialized (wait async handlers).

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`state`

</td>
<td>

[`State`](../type-aliases/State.md)

</td>
<td>

The state to wait for.

</td>
</tr>
</tbody>
</table>

#### Returns

`Promise`\<`void`\>

A promise that resolves when all async handlers are resolved.

## Properties

<table>
<thead>
<tr>
<th>Property</th>
<th>Modifier</th>
<th>Type</th>
<th>Default value</th>
<th>Description</th>
<th>Defined in</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<a id="context"></a> `context`

</td>
<td>

`readonly`

</td>
<td>

`Record`\<`string`, `any`\>

</td>
<td>

`{}`

</td>
<td>

A bag for user/framework-specific values associated with the state lifecycle.

</td>
<td>

[core/src/StateManager.ts:72](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L72)

</td>
</tr>
<tr>
<td>

<a id="key"></a> `key`

</td>
<td>

`readonly`

</td>
<td>

`string`

</td>
<td>

`undefined`

</td>
<td>

The state's key.

</td>
<td>

[core/src/StateManager.ts:104](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L104)

</td>
</tr>
<tr>
<td>

<a id="model"></a> `model`

</td>
<td>

`readonly`

</td>
<td>

[`StateModel`](../type-aliases/StateModel.md)\<`T`\>

</td>
<td>

`undefined`

</td>
<td>

The model class/object used to create the state.

</td>
<td>

[core/src/StateManager.ts:103](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L103)

</td>
</tr>
<tr>
<td>

<a id="state"></a> `state`

</td>
<td>

`readonly`

</td>
<td>

[`State`](../type-aliases/State.md)

</td>
<td>

`undefined`

</td>
<td>

The state instance.

</td>
<td>

[core/src/StateManager.ts:102](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L102)

</td>
</tr>
<tr>
<td>

<a id="store"></a> `store`

</td>
<td>

`readonly`

</td>
<td>

[`StateStore`](StateStore.md)

</td>
<td>

`undefined`

</td>
<td>

Store where the state is kept.

</td>
<td>

[core/src/StateManager.ts:105](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateManager.ts#L105)

</td>
</tr>
</tbody>
</table>
