[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type StateProxy<T> = StateProxyObj<T> & { [K in keyof T as OrdinaryStateKeysType<T, K>]: T[K] } & { readonly [K in keyof T as NotOrdinaryReadonlyStateKeysType<T, K>]: IsInjectedStateType<T[K]> extends true ? WrapStateProxyType<T[K]> : T[K] } & { [K in keyof T as NotOrdinaryWritableStateKeysType<T, K>]: IsInjectedStateType<T[K]> extends true ? WrapStateProxyType<T[K]> : T[K] };
```

Defined in: [core/src/types.ts:199](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L199)

Reactive facade over a state returned by [StateProxyManager](../classes/StateProxyManager.md).

State proxies mirror the surface of the backing state while exposing read-only injected
relationships as nested proxies. They are commonly consumed by view-layer integrations.

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

The model shape represented by the proxy.

</td>
</tr>
</tbody>
</table>
