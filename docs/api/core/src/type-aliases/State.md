[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type State<T> = StateObj<T> & { [K in keyof T as OrdinaryStateKeysType<T, K>]: T[K] } & { readonly [K in keyof T as NotOrdinaryReadonlyStateKeysType<T, K>]: IsInjectedStateType<T[K]> extends true ? WrapStateType<T[K]> : T[K] } & { [K in keyof T as NotOrdinaryWritableStateKeysType<T, K>]: IsInjectedStateType<T[K]> extends true ? WrapStateType<T[K]> : T[K] };
```

Defined in: [core/src/types.ts:162](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L162)

Concrete shape of a FluxModels state managed by [StateManager](../classes/StateManager.md).

The type preserves the model's ordinary properties and remaps injected properties so that
consumers receive wrapped states or proxies when appropriate. Internal metadata symbols
remain hidden from typical iteration.

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

The model shape used to create the state.

</td>
</tr>
</tbody>
</table>
