[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type Event<T> = HandlerT;
```

Defined in: [core/src/types.ts:485](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L485)

Decorator-compatible event definition produced by factories in `events/`.

Calling the event with a handler registers it immediately, while calling with no arguments
returns a decorator that binds the handler to class methods.

## Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`T` *extends* [`EventHandler`](EventHandler.md)

</td>
<td>

The handler signature the event accepts.

</td>
</tr>
</tbody>
</table>

## Call Signature

```ts
type Event<HandlerT>(handler: HandlerT): HandlerT;
```

Defined in: [core/src/types.ts:488](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L488)

Decorator-compatible event definition produced by factories in `events/`.

Calling the event with a handler registers it immediately, while calling with no arguments
returns a decorator that binds the handler to class methods.

### Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`HandlerT` *extends* [`EventHandler`](EventHandler.md)

</td>
</tr>
</tbody>
</table>

### Parameters

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

`handler`

</td>
<td>

`HandlerT`

</td>
</tr>
</tbody>
</table>

### Returns

`HandlerT`

## Call Signature

```ts
type Event(): EventDecorator<(...args: any[]) => any>;
```

Defined in: [core/src/types.ts:489](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L489)

Decorator-compatible event definition produced by factories in `events/`.

Calling the event with a handler registers it immediately, while calling with no arguments
returns a decorator that binds the handler to class methods.

### Returns

[`EventDecorator`](EventDecorator.md)\<(...`args`: `any`[]) => `any`\>

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

<a id="_isevent"></a> `_isEvent`

</td>
<td>

`readonly`

</td>
<td>

`true`

</td>
<td>

[core/src/types.ts:486](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L486)

</td>
</tr>
</tbody>
</table>
