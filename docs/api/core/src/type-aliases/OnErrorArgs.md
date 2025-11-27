[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type OnErrorArgs<T> = {
  error: Error;
  errorPlace: MetaErrorHandlerPlaceType;
  state: State<T> | StateProxy<T>;
};
```

Defined in: [core/src/events/OnError.ts:9](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnError.ts#L9)

Arguments passed to [OnError](../variables/OnError.md) handlers.

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

`T` *extends* [`AnyRecord`](AnyRecord.md)

</td>
<td>

[`AnyRecord`](AnyRecord.md)

</td>
</tr>
</tbody>
</table>

## Properties

<table>
<thead>
<tr>
<th>Property</th>
<th>Type</th>
<th>Description</th>
<th>Defined in</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<a id="error"></a> `error`

</td>
<td>

`Error`

</td>
<td>

Error thrown by the state lifecycle or metadata hooks.

</td>
<td>

[core/src/events/OnError.ts:13](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnError.ts#L13)

</td>
</tr>
<tr>
<td>

<a id="errorplace"></a> `errorPlace`

</td>
<td>

`MetaErrorHandlerPlaceType`

</td>
<td>

Stage of the state lifecycle where the error occurred.

Matches the MetaErrorHandlerPlaceType emitted by [metatyper](https://github.com/metatyper/metatyper?tab=readme-ov-file#errors) (init | get | set | define | delete | validate | deserialize | serialize).

</td>
<td>

[core/src/events/OnError.ts:19](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnError.ts#L19)

</td>
</tr>
<tr>
<td>

<a id="state"></a> `state`

</td>
<td>

[`State`](State.md)\<`T`\> \| [`StateProxy`](StateProxy.md)\<`T`\>

</td>
<td>

State instance whose operation caused the error.

</td>
<td>

[core/src/events/OnError.ts:11](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnError.ts#L11)

</td>
</tr>
</tbody>
</table>
