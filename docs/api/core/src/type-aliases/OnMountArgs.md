[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type OnMountArgs<T> = {
  context?: Record<string, any>;
  stateProxy: StateProxy<T>;
};
```

Defined in: [core/src/events/OnMount.ts:7](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnMount.ts#L7)

Arguments passed to [OnMount](../variables/OnMount.md) handlers.

## Type Parameters

<table>
<thead>
<tr>
<th>Type Parameter</th>
<th>Default type</th>
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

<a id="context"></a> `context?`

</td>
<td>

`Record`\<`string`, `any`\>

</td>
<td>

Optional context provided when mounting the proxy (e.g., render metadata).

</td>
<td>

[core/src/events/OnMount.ts:11](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnMount.ts#L11)

</td>
</tr>
<tr>
<td>

<a id="stateproxy"></a> `stateProxy`

</td>
<td>

[`StateProxy`](StateProxy.md)\<`T`\>

</td>
<td>

State proxy that has just mounted.

</td>
<td>

[core/src/events/OnMount.ts:9](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnMount.ts#L9)

</td>
</tr>
</tbody>
</table>
