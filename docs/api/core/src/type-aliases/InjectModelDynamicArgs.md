[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type InjectModelDynamicArgs<ST, T, KeyResolverT, O, N> = 
  | InjectModelArgs<T extends AnyRecord ? T : AnyRecord, KeyResolverT, O, N>
| (state: ST) => InjectModelArgs<T extends AnyRecord ? T : AnyRecord, KeyResolverT, O, N>;
```

Defined in: [core/src/types.ts:458](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L458)

Injection configuration that can be provided statically or derived from the parent state.

The functional form is handy when the injected proxy key or store depends on runtime state.

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

`ST` *extends* [`AnyRecord`](AnyRecord.md)

</td>
<td>

&hyphen;

</td>
<td>

Parent state shape the dynamic config reads from.

</td>
</tr>
<tr>
<td>

`T` *extends* [`AnyRecord`](AnyRecord.md) \| `undefined` \| `null` \| `void`

</td>
<td>

&hyphen;

</td>
<td>

Injected state shape.

</td>
</tr>
<tr>
<td>

`KeyResolverT` *extends* `string` \| (...`args`: `any`) => [`StateKey`](StateKey.md) \| `undefined`

</td>
<td>

&hyphen;

</td>
<td>

&hyphen;

</td>
</tr>
<tr>
<td>

`O` *extends* `boolean`

</td>
<td>

`boolean`

</td>
<td>

Whether the dependency may be omitted.

</td>
</tr>
<tr>
<td>

`N` *extends* `boolean`

</td>
<td>

`boolean`

</td>
<td>

Whether the dependency may be `null`.

</td>
</tr>
</tbody>
</table>

## Type Declaration

[`InjectModelArgs`](InjectModelArgs.md)\<`T` *extends* [`AnyRecord`](AnyRecord.md) ? `T` : [`AnyRecord`](AnyRecord.md), `KeyResolverT`, `O`, `N`\>

Static configuration applied regardless of parent state.

```ts
(state: ST) => InjectModelArgs<T extends AnyRecord ? T : AnyRecord, KeyResolverT, O, N>
```

## Parameters

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

`ST`

</td>
</tr>
</tbody>
</table>

## Returns

[`InjectModelArgs`](InjectModelArgs.md)\<`T` *extends* [`AnyRecord`](AnyRecord.md) ? `T` : [`AnyRecord`](AnyRecord.md), `KeyResolverT`, `O`, `N`\>

Function that derives configuration from the parent state at runtime.
