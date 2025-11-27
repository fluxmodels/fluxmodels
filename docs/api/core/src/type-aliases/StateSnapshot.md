[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type StateSnapshot<T> = StateSnapshotObj<T> & { readonly [K in keyof T as K extends OrdinaryStateKeysType<T, K> ? K : never]: T[K] } & { readonly [K in keyof T as K extends NotOrdinaryStateKeysType<T, K> ? K : never]: IsInjectedStateType<T[K]> extends true ? WrapStateSnapshotType<T[K]> : T[K] };
```

Defined in: [core/src/types.ts:238](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L238)

Immutable view of a state captured via [StateProxyManager](../classes/StateProxyManager.md).

Snapshots freeze the current state values while preserving type information for injected
structures so they can be safely read outside of reactive contexts.

Snapshots are side-effect free.

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

`T` *extends* [`AnyRecord`](AnyRecord.md)

</td>
<td>

The model shape represented by the snapshot.

</td>
</tr>
</tbody>
</table>
