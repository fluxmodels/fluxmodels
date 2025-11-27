[**@fluxmodels/fluxmodels**](../../README.md)

***

## Functions

<table>
<thead>
<tr>
<th>Function</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

[StateStoreProvider](functions/StateStoreProvider.md)

</td>
<td>

React provider that makes a `StateStore` available to descendants via context.

`useModel` will use this store as the default store when called within the tree.

</td>
</tr>
<tr>
<td>

[StateSuspense](functions/StateSuspense.md)

</td>
<td>

A wrapper for React Suspense that triggers React Suspense for any pending promises collected on a state proxy (marked with @UseSuspense).

</td>
</tr>
<tr>
<td>

[useModel](functions/useModel.md)

</td>
<td>

Creates or reuses a state for the given model and returns a read-only snapshot
plus a function to update the state in a type-safe way.

**Example**

```tsx
class Model {
    name = 'John'
}

const Component = () => {
    const [state, setState] = useModel(Model)

    return <input
             value={state.name}
             onChange={(e) => setState({ name: e.target.value })} />
}
```

</td>
</tr>
<tr>
<td>

[useStateStore](functions/useStateStore.md)

</td>
<td>

Returns the `StateStore` from context, falling back to the default store.

</td>
</tr>
<tr>
<td>

[UseSuspense](functions/UseSuspense.md)

</td>
<td>

Wraps a function to integrate with React Suspense, or decorates a class method.

When the wrapped function returns a promise, a suspense boundary is engaged until
it settles, and then a re-render is triggered.

</td>
</tr>
</tbody>
</table>

## Type Aliases

<table>
<thead>
<tr>
<th>Type Alias</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

[UseModelArgs](type-aliases/UseModelArgs.md)

</td>
<td>

Configuration options for the `useModel` hook.
Combines state creation arguments ([StateArgs](../../core/src/type-aliases/StateArgs.md)) with state proxy configuration
([StateProxyArgs](../../core/src/type-aliases/StateProxyArgs.md)) and adds React-specific options for managing async initialization
and suspense behavior.

</td>
</tr>
</tbody>
</table>
