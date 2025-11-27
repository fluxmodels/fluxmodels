[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type WritableKeys<T> = { [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P> }[keyof T];
```

Defined in: [core/src/types.ts:22](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L22)

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
