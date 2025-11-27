[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type StateProxyArgs<T> = {
  autoResolveObservableProps?: boolean;
  observeProps?: ObservablePropsArgs<T>;
};
```

Defined in: [core/src/types.ts:292](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L292)

Options that influence how [StateProxyManager](../classes/StateProxyManager.md) mounts and manages a state proxy.

Controls observable property detection and lifecycle hooks for injected proxies.

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

The model shape represented by the proxy.

</td>
</tr>
</tbody>
</table>

## Properties

<table>
<thead>
<tr>
<th>Property</th>
<th>Type</th>
<th>Description</th>
<th>Defined in</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<a id="autoresolveobservableprops"></a> `autoResolveObservableProps?`

</td>
<td>

`boolean`

</td>
<td>

Determines whether observable props should be inferred automatically from the state
shape when none are provided explicitly.

</td>
<td>

[core/src/types.ts:297](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L297)

</td>
</tr>
<tr>
<td>

<a id="observeprops"></a> `observeProps?`

</td>
<td>

[`ObservablePropsArgs`](ObservablePropsArgs.md)\<`T`\>

</td>
<td>

Explicit configuration describing which properties of the proxied state should be observed.

</td>
<td>

[core/src/types.ts:301](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/types.ts#L301)

</td>
</tr>
</tbody>
</table>
