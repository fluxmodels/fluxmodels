[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type IsStateOrStateProxyType<T> = IsStateType<T> extends true ? true : IsStateProxyType<T> extends true ? true : false;
```

Defined in: [core/src/types.ts:104](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L104)

Predicate that resolves to `true` when the value is either a state or a state proxy.

This is convenient for APIs that accept both raw states and proxies interchangeably.

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

`T` *extends* [`AnyRecord`](AnyRecord.md)

</td>
<td>

Value (or collection of values) checked by the predicate.

</td>
</tr>
</tbody>
</table>
