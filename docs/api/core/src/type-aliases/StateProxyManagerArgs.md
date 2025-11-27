[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type StateProxyManagerArgs<T> = StateProxyArgs<T> & {
  childrenStateProxyMap?: Map<State, StateProxy>;
  globalStateProxyCacheMap?: Map<State, StateProxy>;
  parentStateProxy?: StateProxy;
};
```

Defined in: [core/src/types.ts:312](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L312)

Configuration accepted by the [StateProxyManager](../classes/StateProxyManager.md) constructor.

Extends [StateProxyArgs](StateProxyArgs.md) with additional options for managing injected state proxies
and their lifecycle initialization.

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

`childrenStateProxyMap?`

</td>
<td>

`Map`\<[`State`](State.md), [`StateProxy`](StateProxy.md)\>

</td>
<td>

Map local to the proxy instance, storing already created children state proxies (injected states).

</td>
<td>

[core/src/types.ts:320](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L320)

</td>
</tr>
<tr>
<td>

`globalStateProxyCacheMap?`

</td>
<td>

`Map`\<[`State`](State.md), [`StateProxy`](StateProxy.md)\>

</td>
<td>

Shared cache map that stores all injected state proxies starting from the root state proxy.

This map is used to cache injected state proxies across the entire proxy tree, preventing
infinite loops in circular dependencies. When injected states reference each other in a cycle,
this map ensures the same proxy instance is reused instead of creating new ones indefinitely.

The cache begins at the root state proxy and includes all `Injected` properties throughout
the dependency graph.

</td>
<td>

[core/src/types.ts:331](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L331)

</td>
</tr>
<tr>
<td>

`parentStateProxy?`

</td>
<td>

[`StateProxy`](StateProxy.md)

</td>
<td>

The parent state proxy, if the proxy is an injected state proxy.

</td>
<td>

[core/src/types.ts:316](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L316)

</td>
</tr>
</tbody>
</table>

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
