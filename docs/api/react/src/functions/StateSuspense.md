[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
function StateSuspense(props: {
  checkDepth?: number;
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
  state: StateProxy;
}): Element;
```

Defined in: [react/src/StateSuspense.tsx:190](https://github.com/fluxmodels/fluxmodels/blob/main/packages/react/src/StateSuspense.tsx#L190)

A wrapper for React Suspense that triggers React Suspense for any pending promises collected on a state proxy (marked with @UseSuspense).

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

`props`

</td>
<td>

\{ `checkDepth?`: `number`; `children?`: `ReactNode`; `fallback?`: `ReactNode`; `name?`: `string`; `state`: [`StateProxy`](../../../core/src/type-aliases/StateProxy.md); \}

</td>
<td>

The arguments for the wrapper.

</td>
</tr>
<tr>
<td>

`props.checkDepth?`

</td>
<td>

`number`

</td>
<td>

The depth of injected state proxies to check for pending promises.

</td>
</tr>
<tr>
<td>

`props.children?`

</td>
<td>

`ReactNode`

</td>
<td>

The children to show when the state proxy is resolved.

</td>
</tr>
<tr>
<td>

`props.fallback?`

</td>
<td>

`ReactNode`

</td>
<td>

The fallback content to show when the state proxy is pending.

</td>
</tr>
<tr>
<td>

`props.name?`

</td>
<td>

`string`

</td>
<td>

The name of the state proxy.

</td>
</tr>
<tr>
<td>

`props.state`

</td>
<td>

[`StateProxy`](../../../core/src/type-aliases/StateProxy.md)

</td>
<td>

The state proxy to trigger React Suspense for.

</td>
</tr>
</tbody>
</table>

## Returns

`Element`

A React Suspense component that triggers React Suspense for any pending promises collected on a state proxy.
