[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type OnInitArgs<T> = {
  state: State<T>;
};
```

Defined in: [core/src/events/OnInit.ts:7](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnInit.ts#L7)

Arguments passed to [OnInit](../variables/OnInit.md) handlers.

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

<a id="state"></a> `state`

</td>
<td>

[`State`](State.md)\<`T`\>

</td>
<td>

State instance that has just been initialized.

</td>
<td>

[core/src/events/OnInit.ts:9](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnInit.ts#L9)

</td>
</tr>
</tbody>
</table>
