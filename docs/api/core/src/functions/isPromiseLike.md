[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
function isPromiseLike<T>(x: T): boolean;
```

Defined in: [core/src/utils/promises.ts:7](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/utils/promises.ts#L7)

Lightweight check whether a value behaves like a Promise (thenable/catch/finally).

## Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`T`

</td>
</tr>
</tbody>
</table>

## Parameters

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

`x`

</td>
<td>

`T`

</td>
<td>

Value to check.

</td>
</tr>
</tbody>
</table>

## Returns

`boolean`

Whether the value looks like a promise.
