[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type InjectModelArgs<T, KeyResolverT, OptionalT, NullableT> = StateProxyArgs<T> & {
  keyFrom?: string | symbol;
  keyResolver?: KeyResolverT;
  nullable?: NullableT;
  optional?: OptionalT;
  store?:   | StateStore
     | typeof INJECT_STORE;
};
```

Defined in: [core/src/types.ts:411](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L411)

Extends [StateProxyArgs](StateProxyArgs.md) with knobs specific to injected dependencies.

Options such as `keyFrom`, `optional`, and `nullable` are interpreted by the metadata layer
(see `metatypes/InjectModel`) when preparing nested state proxies.

## Type Declaration

<table>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Description</th>
<th>Defined in</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`keyFrom?`

</td>
<td>

`string` \| `symbol`

</td>
<td>

Property name or symbol from the parent state whose value should be used as the injected
state's key.

</td>
<td>

[core/src/types.ts:421](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L421)

</td>
</tr>
<tr>
<td>

`keyResolver?`

</td>
<td>

`KeyResolverT`

</td>
<td>

Function that resolves the key from the assigned object.
If provided string, it will be used as the property name on the assigned object.
If provided function, it will be called with the assigned object and should return the key.
If key is undefined, the injected state will be undefined.
If key is null, the injected state will be null.
If the state is not optional and the key is undefined, an error will be thrown.
If the state is not nullable and the key is null, an error will be thrown.
If not provided, the injected state will be readonly.

</td>
<td>

[core/src/types.ts:432](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L432)

</td>
</tr>
<tr>
<td>

`nullable?`

</td>
<td>

`NullableT`

</td>
<td>

Allows the dependency to resolve to `null` in addition to regular state instances.

</td>
<td>

[core/src/types.ts:445](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L445)

</td>
</tr>
<tr>
<td>

`optional?`

</td>
<td>

`OptionalT`

</td>
<td>

Flags the dependency as optional so missing values will not throw during resolution.

</td>
<td>

[core/src/types.ts:441](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L441)

</td>
</tr>
<tr>
<td>

`store?`

</td>
<td>

  \| [`StateStore`](../classes/StateStore.md)
  \| *typeof* [`INJECT_STORE`](../variables/INJECT_STORE.md)

</td>
<td>

Store instance (or injection token) where the dependent state should be resolved.
By default, the injected state uses the same store as its parent state (INJECT_STORE).

</td>
<td>

[core/src/types.ts:437](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L437)

</td>
</tr>
</tbody>
</table>

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

The injected state shape.

</td>
</tr>
<tr>
<td>

`KeyResolverT` *extends* `string` \| (...`args`: `any`) => `any` \| `undefined`

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

`OptionalT` *extends* `boolean`

</td>
<td>

`boolean`

</td>
<td>

&hyphen;

</td>
</tr>
<tr>
<td>

`NullableT` *extends* `boolean`

</td>
<td>

`boolean`

</td>
<td>

&hyphen;

</td>
</tr>
</tbody>
</table>

## Type Param

Whether the dependency may be omitted.

## Type Param

Whether the dependency may be `null`.
