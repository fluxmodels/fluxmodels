[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type UseModelArgs<T> = StateArgs<T> & StateProxyArgs<T> & {
  store?: StateStore;
  useSuspenseDepth?: number;
};
```

Defined in: [react/src/useModel.ts:26](https://github.com/fluxmodels/fluxmodels/blob/main/packages/react/src/useModel.ts#L26)

Configuration options for the `useModel` hook.
Combines state creation arguments ([StateArgs](../../../core/src/type-aliases/StateArgs.md)) with state proxy configuration
([StateProxyArgs](../../../core/src/type-aliases/StateProxyArgs.md)) and adds React-specific options for managing async initialization
and suspense behavior.

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

`store?`

</td>
<td>

[`StateStore`](../../../core/src/classes/StateStore.md)

</td>
<td>

Store instance that should hold the state.
Defaults to the store provided by `useStateStore()` (from `StateStoreProvider`),
or falls back to `StateStore.defaultStore` if no provider is present.

</td>
<td>

[react/src/useModel.ts:33](https://github.com/fluxmodels/fluxmodels/blob/main/packages/react/src/useModel.ts#L33)

</td>
</tr>
<tr>
<td>

`useSuspenseDepth?`

</td>
<td>

`number`

</td>
<td>

Depth of injected state proxies (managed by `StateProxyManager`) inspected by
`waitUseSuspensePromises` for pending async initializers such as those marked with
`\@UseSuspense`. Use `-1` to traverse without limits.

</td>
<td>

[react/src/useModel.ts:39](https://github.com/fluxmodels/fluxmodels/blob/main/packages/react/src/useModel.ts#L39)

</td>
</tr>
</tbody>
</table>

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

`T` *extends* [`AnyRecord`](../../../core/src/type-aliases/AnyRecord.md)

</td>
<td>

The shape of the state model.

</td>
</tr>
</tbody>
</table>
