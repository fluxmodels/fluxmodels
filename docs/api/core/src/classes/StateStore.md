[**@fluxmodels/fluxmodels**](../../../README.md)

***

Defined in: [core/src/StateStore.ts:15](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateStore.ts#L15)

StateStore is responsible for managing and storing state instances.
It provides methods to find, retrieve, and add states associated with models.

The store uses a two-level map structure:
- The outer map uses the model as the key and stores an inner map for each model.
- The inner map uses a custom key (or a default symbol) to store individual state instances.

This structure allows efficient storage and retrieval of states based on their models and keys from the RAM memory.

## Accessors

### defaultStore

#### Get Signature

```ts
get static defaultStore(): StateStore;
```

Defined in: [core/src/StateStore.ts:16](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateStore.ts#L16)

##### Returns

`StateStore`

## Constructors

### Constructor

```ts
new StateStore(): StateStore;
```

#### Returns

`StateStore`

## Methods

### addState()

```ts
addState<T>(
   model: StateModel<T>, 
   state: State<T>, 
   key?: string): void;
```

Defined in: [core/src/StateStore.ts:94](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateStore.ts#L94)

Adds a state to the store for the given model and key.

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

The model to add the state for.

</td>
</tr>
<tr>
<td>

`state`

</td>
<td>

[`State`](../type-aliases/State.md)\<`T`\>

</td>
<td>

The state to add.

</td>
</tr>
<tr>
<td>

`key?`

</td>
<td>

`string`

</td>
<td>

An optional custom key for the state. If not provided, the default key will be used.

</td>
</tr>
</tbody>
</table>

#### Returns

`void`

***

### clearStore()

```ts
clearStore(): void;
```

Defined in: [core/src/StateStore.ts:128](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateStore.ts#L128)

Clears the entire state store.

#### Returns

`void`

***

### findState()

```ts
findState<T>(model: StateModel<T>, key: string): State<T> | null;
```

Defined in: [core/src/StateStore.ts:37](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateStore.ts#L37)

Finds a state associated with the given model and key.

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

The model to find the state for.

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

The key to find the state for.

</td>
</tr>
</tbody>
</table>

#### Returns

[`State`](../type-aliases/State.md)\<`T`\> \| `null`

The state if found, otherwise null.

***

### findStates()

```ts
findStates<T>(model: StateModel<T>, keyFilterFunc?: (existsKey: string, state: State<T>) => boolean): State<T>[];
```

Defined in: [core/src/StateStore.ts:54](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateStore.ts#L54)

Retrieves all states associated with the given model.

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

The model to retrieve states for.

</td>
</tr>
<tr>
<td>

`keyFilterFunc?`

</td>
<td>

(`existsKey`: `string`, `state`: [`State`](../type-aliases/State.md)\<`T`\>) => `boolean`

</td>
<td>

An optional function to filter states by key.

</td>
</tr>
</tbody>
</table>

#### Returns

[`State`](../type-aliases/State.md)\<`T`\>[]

An array of states associated with the model.

***

### getKeys()

```ts
getKeys<T>(model: StateModel<T>): string[];
```

Defined in: [core/src/StateStore.ts:79](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateStore.ts#L79)

Retrieves all keys associated with the given model.

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

The model to retrieve keys for.

</td>
</tr>
</tbody>
</table>

#### Returns

`string`[]

An array of keys associated with the model.

***

### removeState()

```ts
removeState<T>(model: StateModel<T>, key: string): void;
```

Defined in: [core/src/StateStore.ts:115](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateStore.ts#L115)

Removes a state from the store for the given model and key.

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

The model to remove the state for.

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

The key of the state to remove.

</td>
</tr>
</tbody>
</table>

#### Returns

`void`
