[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
function StateStoreProvider(args: {
  children?: ReactNode;
  store: StateStore;
}): FunctionComponentElement<{
  value: StateStore | undefined;
}>;
```

Defined in: [react/src/StateStoreProvider.ts:23](https://github.com/fluxmodels/fluxmodels/blob/main/packages/react/src/StateStoreProvider.ts#L23)

React provider that makes a `StateStore` available to descendants via context.

`useModel` will use this store as the default store when called within the tree.

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

`args`

</td>
<td>

\{ `children?`: `ReactNode`; `store`: [`StateStore`](../../../core/src/classes/StateStore.md); \}

</td>
<td>

Provider props.

</td>
</tr>
<tr>
<td>

`args.children?`

</td>
<td>

`ReactNode`

</td>
<td>

Child nodes to render within the provider.

</td>
</tr>
<tr>
<td>

`args.store`

</td>
<td>

[`StateStore`](../../../core/src/classes/StateStore.md)

</td>
<td>

The `StateStore` instance to provide.

</td>
</tr>
</tbody>
</table>

## Returns

`FunctionComponentElement`\<\{
  `value`: [`StateStore`](../../../core/src/classes/StateStore.md) \| `undefined`;
\}\>

A provider element for the models store.
