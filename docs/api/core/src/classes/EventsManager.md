[**@fluxmodels/fluxmodels**](../../../README.md)

***

Defined in: [core/src/EventsManager.ts:11](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/EventsManager.ts#L11)

Class responsible for managing events and their handlers.

## Constructors

### Constructor

```ts
new EventsManager(targetObject: AnyRecord): EventsManager;
```

Defined in: [core/src/EventsManager.ts:17](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/EventsManager.ts#L17)

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

[`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
<td>

The targetObject object to manage events for.

</td>
</tr>
</tbody>
</table>

#### Returns

`EventsManager`

## Methods

### emit()

```ts
emit<T>(
   event: Event<T>, 
   args?: Parameters<T>, 
   _this?: object): Promise<any[]> | undefined;
```

Defined in: [core/src/EventsManager.ts:89](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/EventsManager.ts#L89)

Emits an event with the specified arguments and optional context.

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

`T` *extends* [`EventHandler`](../type-aliases/EventHandler.md)

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

`event`

</td>
<td>

[`Event`](../type-aliases/Event.md)\<`T`\>

</td>
<td>

The event to emit.

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

`Parameters`\<`T`\>

</td>
<td>

The arguments to pass to the event handlers.

</td>
</tr>
<tr>
<td>

`_this?`

</td>
<td>

`object`

</td>
<td>

The context object to use when calling the event handlers.

</td>
</tr>
</tbody>
</table>

#### Returns

`Promise`\<`any`[]\> \| `undefined`

***

### getHandlers()

```ts
getHandlers<T>(event: Event<T>): Set<EventHandler>;
```

Defined in: [core/src/EventsManager.ts:62](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/EventsManager.ts#L62)

Returns the handler set for a given event, creating it if necessary.

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

`T` *extends* [`EventHandler`](../type-aliases/EventHandler.md)

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

`event`

</td>
<td>

[`Event`](../type-aliases/Event.md)\<`T`\>

</td>
<td>

The event whose handlers set is requested.

</td>
</tr>
</tbody>
</table>

#### Returns

`Set`\<[`EventHandler`](../type-aliases/EventHandler.md)\>

A mutable set of handlers for the event.

***

### subscribe()

```ts
subscribe<T>(event: Event<T>, handler: T): boolean;
```

Defined in: [core/src/EventsManager.ts:109](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/EventsManager.ts#L109)

Subscribes a handler to an event.

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

`T` *extends* [`EventHandler`](../type-aliases/EventHandler.md)

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

`event`

</td>
<td>

[`Event`](../type-aliases/Event.md)\<`T`\>

</td>
<td>

The event to subscribe to.

</td>
</tr>
<tr>
<td>

`handler`

</td>
<td>

`T`

</td>
<td>

The handler to subscribe.

</td>
</tr>
</tbody>
</table>

#### Returns

`boolean`

***

### unsubscribe()

```ts
unsubscribe<T>(event: Event<T>, handler: T): boolean;
```

Defined in: [core/src/EventsManager.ts:129](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/EventsManager.ts#L129)

Unsubscribes a handler from an event.

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

`T` *extends* [`EventHandler`](../type-aliases/EventHandler.md)

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

`event`

</td>
<td>

[`Event`](../type-aliases/Event.md)\<`T`\>

</td>
<td>

The event to unsubscribe from.

</td>
</tr>
<tr>
<td>

`handler`

</td>
<td>

`T`

</td>
<td>

The handler to unsubscribe.

</td>
</tr>
</tbody>
</table>

#### Returns

`boolean`

***

### newEvent()

```ts
static newEvent<T>(name?: string): Event<T>;
```

Defined in: [core/src/EventsManager.ts:149](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/EventsManager.ts#L149)

Creates a new event with the specified name.

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

`T` *extends* [`EventHandler`](../type-aliases/EventHandler.md)

</td>
<td>

[`EventHandler`](../type-aliases/EventHandler.md)

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

`name?`

</td>
<td>

`string`

</td>
<td>

The name of the event.

</td>
</tr>
</tbody>
</table>

#### Returns

[`Event`](../type-aliases/Event.md)\<`T`\>

The new event.

## Properties

<table>
<thead>
<tr>
<th>Property</th>
<th>Modifier</th>
<th>Type</th>
<th>Defined in</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<a id="targetobject"></a> `targetObject`

</td>
<td>

`readonly`

</td>
<td>

[`AnyRecord`](../type-aliases/AnyRecord.md)

</td>
<td>

[core/src/EventsManager.ts:12](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/EventsManager.ts#L12)

</td>
</tr>
</tbody>
</table>
