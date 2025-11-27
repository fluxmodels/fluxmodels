[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type IsStateType<T, RT> = RT extends {
  [IsStateSymbol]: true;
} ? true : false;
```

Defined in: [core/src/types.ts:75](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L75)

Type-level predicate that evaluates to `true` when the value is a FluxModels state.

The helper unwraps nullable and array types before checking for the hidden
IsStateSymbol marker attached by [StateManager](../classes/StateManager.md).

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

`T`

</td>
<td>

&hyphen;

</td>
<td>

Value (or collection of values) that may be a state.

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
