[**@fluxmodels/fluxmodels**](../../../README.md)

***

```ts
type OnChangeArgs<T> = {
  newValue: any;
  prevValue: any;
  propName: string | symbol;
  state: State<T> | StateProxy<T>;
};
```

Defined in: [core/src/events/OnChange.ts:7](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnChange.ts#L7)

Arguments passed to [OnChange](../variables/OnChange.md) handlers.

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

<a id="newvalue"></a> `newValue`

</td>
<td>

`any`

</td>
<td>

New value assigned to the property.

</td>
<td>

[core/src/events/OnChange.ts:15](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnChange.ts#L15)

</td>
</tr>
<tr>
<td>

<a id="prevvalue"></a> `prevValue`

</td>
<td>

`any`

</td>
<td>

Previous value of the property.

</td>
<td>

[core/src/events/OnChange.ts:13](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnChange.ts#L13)

</td>
</tr>
<tr>
<td>

<a id="propname"></a> `propName`

</td>
<td>

`string` \| `symbol`

</td>
<td>

Property that changed on the state object.

</td>
<td>

[core/src/events/OnChange.ts:11](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnChange.ts#L11)

</td>
</tr>
<tr>
<td>

<a id="state"></a> `state`

</td>
<td>

[`State`](State.md)\<`T`\> \| [`StateProxy`](StateProxy.md)\<`T`\>

</td>
<td>

State instance that triggered the change notification.

</td>
<td>

[core/src/events/OnChange.ts:9](https://github.com/fluxmodels/fluxmodels/blob/main/packages/core/src/events/OnChange.ts#L9)

</td>
</tr>
</tbody>
</table>
