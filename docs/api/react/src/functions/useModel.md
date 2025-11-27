[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
function useModel<T>(model: StateModel<T>, args?: UseModelArgs<T>): readonly [StateSnapshot<T>, (raw: { [key in string | number | symbol]?: T[key] }) => void];
```

Defined in: [react/src/useModel.ts:75](https://github.com/fluxmodels/fluxmodels/blob/main/packages/react/src/useModel.ts#L75)

Creates or reuses a state for the given model and returns a read-only snapshot
plus a function to update the state in a type-safe way.

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

`T` *extends* [`AnyRecord`](../../../core/src/type-aliases/AnyRecord.md)

</td>
</tr>
</tbody>
</table>

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

`model`

</td>
<td>

[`StateModel`](../../../core/src/type-aliases/StateModel.md)\<`T`\>

</td>
<td>

The model class/object or factory used to build the state.

</td>
</tr>
<tr>
<td>

`args?`

</td>
<td>

[`UseModelArgs`](../type-aliases/UseModelArgs.md)\<`T`\>

</td>
<td>

Optional configuration (key, store, observable props, meta args, etc.).

</td>
</tr>
</tbody>
</table>

## Returns

readonly \[[`StateSnapshot`](../../../core/src/type-aliases/StateSnapshot.md)\<`T`\>, (`raw`: \{ \[key in string \| number \| symbol\]?: T\[key\] \}) => `void`\]

A tuple `[stateSnapshot, update]` where `stateSnapshot` is an immutable snapshot
         of the state suitable for rendering, and `update` applies partial updates
         using model field types.

## Example

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
