[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type IsInjectedStateType<T, Readonly, RT> = Required<RT> extends {
  _injected: true;
  _readonly: Readonly;
} ? true : false;
```

Defined in: [core/src/types.ts:380](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L380)

Predicate that evaluates to `true` for values marked via [InjectedState](InjectedState.md).

Injection-aware helpers rely on this marker to determine whether a property should be
lazily resolved into another state or proxy instead of being copied.

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

Value (or collection of values) that may be an injected record.

</td>
</tr>
<tr>
<td>

`Readonly` *extends* `boolean`

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
