[**@fluxmodels/fluxmodels**](../../../README.md)

***

Defined in: [core/src/StateProxyManager.ts:46](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L46)

Manages the lifecycle, observation, and snapshotting of a state proxy.

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

Defined in: [core/src/StateProxyManager.ts:69](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L69)

##### Returns

[`EventsManager`](EventsManager.md)

***

### isMounted

#### Get Signature

```ts
get isMounted(): boolean;
```

Defined in: [core/src/StateProxyManager.ts:65](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L65)

##### Returns

`boolean`

***

### stateProxyId

#### Get Signature

```ts
get stateProxyId(): string;
```

Defined in: [core/src/StateProxyManager.ts:61](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L61)

##### Returns

`string`

## Constructors

### Constructor

```ts
new StateProxyManager<T>(
   state: State<T>, 
   stateProxy: StateProxy<T>, 
args?: StateProxyManagerArgs<T>): StateProxyManager<T>;
```

Defined in: [core/src/StateProxyManager.ts:95](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L95)

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

`state`

</td>
<td>

[`State`](../type-aliases/State.md)\<`T`\>

</td>
</tr>
<tr>
<td>

`stateProxy`

</td>
<td>

[`StateProxy`](../type-aliases/StateProxy.md)\<`T`\>

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

[`StateProxyManagerArgs`](../type-aliases/StateProxyManagerArgs.md)\<`T`\>

</td>
</tr>
</tbody>
</table>

#### Returns

`StateProxyManager`\<`T`\>

## Methods

### createSnapshot()

```ts
createSnapshot(): StateSnapshot<T>;
```

Defined in: [core/src/StateProxyManager.ts:241](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L241)

Creates an immutable, side-effect-free snapshot of the state proxy.

#### Returns

[`StateSnapshot`](../type-aliases/StateSnapshot.md)\<`T`\>

A snapshot object with the same shape as the state proxy.

***

### isObservableProp()

```ts
isObservableProp(propName: string | symbol): boolean;
```

Defined in: [core/src/StateProxyManager.ts:323](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L323)

Checks if a property is considered observable by this manager.

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

Property name to check.

</td>
</tr>
</tbody>
</table>

#### Returns

`boolean`

Whether the property is observable.

***

### mount()

```ts
mount(changeObservablesHandler: MountHandlerType, context?: Record<string, any>): void;
```

Defined in: [core/src/StateProxyManager.ts:173](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L173)

Mounts the state proxy: subscribes to observable changes and emits `OnMount`.
Pass a handler to be called when observable props change.

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

`changeObservablesHandler`

</td>
<td>

[`MountHandlerType`](../type-aliases/MountHandlerType.md)

</td>
<td>

Called when observed properties change.

</td>
</tr>
<tr>
<td>

`context?`

</td>
<td>

`Record`\<`string`, `any`\>

</td>
<td>

Optional context forwarded to `OnMount` handlers.

</td>
</tr>
</tbody>
</table>

#### Returns

`void`

***

### refresh()

```ts
refresh(): void;
```

Defined in: [core/src/StateProxyManager.ts:352](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L352)

Refreshes the state proxy: rebuilds the children state proxies if the state version has changed.
Used to mount/unmount injected state proxies if the states have changed.

#### Returns

`void`

***

### representState()

```ts
representState(isSnapshot: boolean): string;
```

Defined in: [core/src/StateProxyManager.ts:306](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L306)

Returns a human-friendly string representation of the state proxy.

#### Parameters

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Default value</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`isSnapshot`

</td>
<td>

`boolean`

</td>
<td>

`false`

</td>
</tr>
</tbody>
</table>

#### Returns

`string`

A string representation of the state proxy.

***

### triggerMountHandler()

```ts
triggerMountHandler(): void;
```

Defined in: [core/src/StateProxyManager.ts:339](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L339)

#### Returns

`void`

***

### unmount()

```ts
unmount(): void;
```

Defined in: [core/src/StateProxyManager.ts:210](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L210)

Unmounts the state proxy: unsubscribes and emits `OnUnmount`.

#### Returns

`void`

***

### addMountedStateProxy()

```ts
static addMountedStateProxy(stateProxy: StateProxy<AnyRecord>): void;
```

Defined in: [core/src/StateProxyManager.ts:608](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L608)

Adds a state proxy to the mounted set for its state.

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

`stateProxy`

</td>
<td>

[`StateProxy`](../type-aliases/StateProxy.md)\<[`AnyRecord`](../type-aliases/AnyRecord.md)\>

</td>
<td>

The proxy to add.

</td>
</tr>
</tbody>
</table>

#### Returns

`void`

***

### getMountedStateProxies()

```ts
static getMountedStateProxies(stateOrStateProxy: 
  | StateProxy
| State): Set<StateProxy>;
```

Defined in: [core/src/StateProxyManager.ts:591](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L591)

Returns a set of mounted state proxies related to a given state or state proxy.

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

`stateOrStateProxy`

</td>
<td>

 \| [`StateProxy`](../type-aliases/StateProxy.md) \| [`State`](../type-aliases/State.md)

</td>
<td>

A state or state proxy.

</td>
</tr>
</tbody>
</table>

#### Returns

`Set`\<[`StateProxy`](../type-aliases/StateProxy.md)\>

A set of mounted state proxies related to the state.

***

### getOrCreateStateProxy()

```ts
static getOrCreateStateProxy<T>(state: State<T>, args?: StateProxyManagerArgs<T>): readonly [StateProxy<T>, boolean];
```

Defined in: [core/src/StateProxyManager.ts:647](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L647)

Gets or creates a new state proxy for a given state, configuring observation rules.

#### Type Parameters

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

[`State`](../type-aliases/State.md)\<`T`\>

</td>
<td>

The state instance to wrap.

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

[`StateProxyManagerArgs`](../type-aliases/StateProxyManagerArgs.md)\<`T`\>

</td>
<td>

Optional configuration for observation and injection.

</td>
</tr>
</tbody>
</table>

#### Returns

readonly \[[`StateProxy`](../type-aliases/StateProxy.md)\<`T`\>, `boolean`\]

A tuple `[stateProxy, isNew]` where `stateProxy` is the new state proxy that wraps the given state, and `isNew` is a boolean indicating if the state proxy is new.

***

### instance()

#### Call Signature

```ts
static instance<T>(stateProxy: StateProxy<T>): StateProxyManager<T>;
```

Defined in: [core/src/StateProxyManager.ts:50](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L50)

Returns the `StateProxyManager` instance attached to a given state proxy.

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
</tr>
</thead>
<tbody>
<tr>
<td>

`stateProxy`

</td>
<td>

[`StateProxy`](../type-aliases/StateProxy.md)\<`T`\>

</td>
</tr>
</tbody>
</table>

##### Returns

`StateProxyManager`\<`T`\>

#### Call Signature

```ts
static instance<T>(stateProxy: 
  | void
  | StateProxy<T>
  | null
  | undefined): StateProxyManager<T> | undefined;
```

Defined in: [core/src/StateProxyManager.ts:51](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L51)

Returns the `StateProxyManager` instance attached to a given state proxy.

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
</tr>
</thead>
<tbody>
<tr>
<td>

`stateProxy`

</td>
<td>

 \| `void` \| [`StateProxy`](../type-aliases/StateProxy.md)\<`T`\> \| `null` \| `undefined`

</td>
</tr>
</tbody>
</table>

##### Returns

`StateProxyManager`\<`T`\> \| `undefined`

***

### isStateProxy()

```ts
static isStateProxy(stateProxy: any): boolean;
```

Defined in: [core/src/StateProxyManager.ts:581](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L581)

Returns true if the value is a FluxModels State Proxy.

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

`stateProxy`

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

Whether the value is a state proxy.

***

### removeMountedStateProxy()

```ts
static removeMountedStateProxy(stateProxy: StateProxy<AnyRecord>): void;
```

Defined in: [core/src/StateProxyManager.ts:628](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L628)

Removes a state proxy from the mounted set for its state.

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

`stateProxy`

</td>
<td>

[`StateProxy`](../type-aliases/StateProxy.md)\<[`AnyRecord`](../type-aliases/AnyRecord.md)\>

</td>
<td>

The proxy to remove.

</td>
</tr>
</tbody>
</table>

#### Returns

`void`

## Properties

<table>
<thead>
<tr>
<th>Property</th>
<th>Modifier</th>
<th>Type</th>
<th>Default value</th>
<th>Defined in</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<a id="autoresolveobservableprops"></a> `autoResolveObservableProps`

</td>
<td>

`public`

</td>
<td>

`boolean`

</td>
<td>

`true`

</td>
<td>

[core/src/StateProxyManager.ts:73](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L73)

</td>
</tr>
<tr>
<td>

<a id="childrenstateproxymap"></a> `childrenStateProxyMap`

</td>
<td>

`readonly`

</td>
<td>

`Map`\<[`State`](../type-aliases/State.md), [`StateProxy`](../type-aliases/StateProxy.md)\>

</td>
<td>

`undefined`

</td>
<td>

[core/src/StateProxyManager.ts:82](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L82)

</td>
</tr>
<tr>
<td>

<a id="globalstateproxycachemap"></a> `globalStateProxyCacheMap`

</td>
<td>

`readonly`

</td>
<td>

`Map`\<[`State`](../type-aliases/State.md), [`StateProxy`](../type-aliases/StateProxy.md)\>

</td>
<td>

`undefined`

</td>
<td>

[core/src/StateProxyManager.ts:81](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L81)

</td>
</tr>
<tr>
<td>

<a id="isroot"></a> `isRoot`

</td>
<td>

`readonly`

</td>
<td>

`boolean`

</td>
<td>

`false`

</td>
<td>

[core/src/StateProxyManager.ts:79](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L79)

</td>
</tr>
<tr>
<td>

<a id="mountcontext"></a> `mountContext`

</td>
<td>

`public`

</td>
<td>

`Record`\<`string`, `any`\>

</td>
<td>

`{}`

</td>
<td>

[core/src/StateProxyManager.ts:77](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L77)

</td>
</tr>
<tr>
<td>

<a id="mounthandler"></a> `mountHandler?`

</td>
<td>

`public`

</td>
<td>

[`MountHandlerType`](../type-aliases/MountHandlerType.md)

</td>
<td>

`undefined`

</td>
<td>

[core/src/StateProxyManager.ts:76](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L76)

</td>
</tr>
<tr>
<td>

<a id="observableprops"></a> `observableProps`

</td>
<td>

`public`

</td>
<td>

[`ObservableProps`](../type-aliases/ObservableProps.md)

</td>
<td>

`{}`

</td>
<td>

[core/src/StateProxyManager.ts:74](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L74)

</td>
</tr>
<tr>
<td>

<a id="oldchildrenstateproxymap"></a> `oldChildrenStateProxyMap`

</td>
<td>

`readonly`

</td>
<td>

`Map`\<[`State`](../type-aliases/State.md), [`StateProxy`](../type-aliases/StateProxy.md)\>

</td>
<td>

`undefined`

</td>
<td>

[core/src/StateProxyManager.ts:83](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L83)

</td>
</tr>
<tr>
<td>

<a id="parentstateproxy"></a> `parentStateProxy?`

</td>
<td>

`readonly`

</td>
<td>

[`StateProxy`](../type-aliases/StateProxy.md)

</td>
<td>

`undefined`

</td>
<td>

[core/src/StateProxyManager.ts:80](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L80)

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

[`State`](../type-aliases/State.md)\<`T`\>

</td>
<td>

`undefined`

</td>
<td>

[core/src/StateProxyManager.ts:96](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L96)

</td>
</tr>
<tr>
<td>

<a id="stateproxy"></a> `stateProxy`

</td>
<td>

`readonly`

</td>
<td>

[`StateProxy`](../type-aliases/StateProxy.md)\<`T`\>

</td>
<td>

`undefined`

</td>
<td>

[core/src/StateProxyManager.ts:97](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/StateProxyManager.ts#L97)

</td>
</tr>
</tbody>
</table>
