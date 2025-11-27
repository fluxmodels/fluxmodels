[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type InjectedState<T, Readonly> = T & {
  _injected?: true;
  _readonly?: Readonly;
};
```

Defined in: [core/src/types.ts:396](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L396)

Convenience helper to tag an object as an injected dependency.

The optional `_injected` flag is consumed by [IsInjectedStateType](IsInjectedStateType.md) and the state/proxy
managers to decide how to wrap the property during state construction.

## Type Declaration

<table>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Defined in</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`_injected?`

</td>
<td>

`true`

</td>
<td>

[core/src/types.ts:397](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L397)

</td>
</tr>
<tr>
<td>

`_readonly?`

</td>
<td>

`Readonly`

</td>
<td>

[core/src/types.ts:398](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L398)

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

Shape of the injected dependency.

</td>
</tr>
<tr>
<td>

`Readonly` *extends* `boolean`

</td>
<td>

`false`

</td>
<td>

&hyphen;

</td>
</tr>
</tbody>
</table>
