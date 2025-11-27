[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type IsStateProxyType<T, RT> = RT extends {
  [IsStateProxySymbol]: true;
} ? true : false;
```

Defined in: [core/src/types.ts:90](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L90)

Type-level predicate that evaluates to `true` when the value is a FluxModels state proxy.

Proxies are created by [StateProxyManager](../classes/StateProxyManager.md) and expose the IsStateProxySymbol
marker consumed by this helper.

## Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
<th>Default type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`T` *extends* [`AnyRecord`](AnyRecord.md)

</td>
<td>

&hyphen;

</td>
<td>

Value (or collection of values) that may be a proxy.

</td>
</tr>
<tr>
<td>

`RT`

</td>
<td>

`T` *extends* readonly `any`[] ? `Exclude`\<`T`\[`number`\], `undefined` \| `null` \| `void`\> : `Exclude`\<`T`, `undefined` \| `null` \| `void`\>

</td>
<td>

&hyphen;

</td>
</tr>
</tbody>
</table>
