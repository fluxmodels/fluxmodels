[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type StateModel<T> = T | (...args: any[]) => T;
```

Defined in: [core/src/types.ts:43](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L43)

Model definition that [StateManager](../classes/StateManager.md) can use to construct a state.

A model can either be a plain object (used as-is) or a constructor that produces the state
instance when invoked.

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

[`AnyRecord`](AnyRecord.md)

</td>
<td>

Shape of the state returned from the model.

</td>
</tr>
</tbody>
</table>
