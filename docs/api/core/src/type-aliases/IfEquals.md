[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type IfEquals<X, Y, A, B> = <T>() => T extends X ? 1 : 2 extends <T>() => T extends Y ? 1 : 2 ? A : B;
```

Defined in: [core/src/types.ts:19](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L19)

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

`X`

</td>
<td>

&hyphen;

</td>
</tr>
<tr>
<td>

`Y`

</td>
<td>

&hyphen;

</td>
</tr>
<tr>
<td>

`A`

</td>
<td>

`X`

</td>
</tr>
<tr>
<td>

`B`

</td>
<td>

`never`

</td>
</tr>
</tbody>
</table>
